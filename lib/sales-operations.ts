import { supabase } from "./supabase"

// ============================================================
// Types & Interfaces
// ============================================================

export interface Customer {
  id: string
  customer_name: string
  type: string
  balanceiqd: number
  balanceusd: number
}

export interface InventoryItem {
  id: string
  storeid: string
  productcode: string
  productname: string
  quantity: number
  unit: string
  sellpriceiqd: number
  sellpriceusd: number
}

export interface SaleMain {
  id?: string
  numberofsale: string
  salestoreid: string
  customerid: string
  customername: string
  pricetype: "جملة" | "مفرد"
  paytype: "نقدي" | "آجل"
  currencytype: "دينار" | "دولار"
  details?: string
  datetime: string
  discountenabled: boolean
  discountcurrency?: "دينار" | "دولار"
  discountiqd: number
  discountusd: number
  totalsaleiqd: number
  totalsaleusd: number
  amountreceivediqd: number
  amountreceivedusd: number
  finaltotaliqd: number
  finaltotalusd: number
}

export interface SaleDetail {
  id?: string
  salemainid?: string
  productcode: string
  productname: string
  storeid: string
  quantity: number
  unitpriceiqd: number
  unitpriceusd: number
  totalpriceiqd: number
  totalpriceusd: number
  notes?: string
}

export interface SaleProductRow extends SaleDetail {
  tempId: string
}

// ============================================================
// Get All Customers
// ============================================================

export async function getAllCustomers(): Promise<Customer[]> {
  try {
    const { data, error } = await supabase
      .from("customers")
      .select("id, customer_name, type, balanceiqd, balanceusd")
      .order("customer_name")

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching customers:", error)
    return []
  }
}

// ============================================================
// Get Customer By ID
// ============================================================

export async function getCustomerById(customerId: string): Promise<Customer | null> {
  try {
    const { data, error } = await supabase
      .from("customers")
      .select("id, customer_name, type, balanceiqd, balanceusd")
      .eq("id", customerId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error fetching customer:", error)
    return null
  }
}

// ============================================================
// Generate Next Sale Number
// ============================================================

export async function generateNextSaleNumber(): Promise<string> {
  try {
    // جلب آخر رقم قائمة
    const { data, error } = await supabase
      .from("tb_salesmain")
      .select("numberofsale")
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned (الجدول فارغ)
      throw error
    }

    if (!data || !data.numberofsale) {
      // إذا كان الجدول فارغاً، ابدأ من S-00001
      return "S-00001"
    }

    // استخراج الرقم من آخر قائمة (مثال: S-00001 → 1)
    const lastNumber = data.numberofsale.replace("S-", "")
    const nextNumber = parseInt(lastNumber) + 1

    // تنسيق الرقم الجديد بـ 5 خانات (مثال: 2 → 00002)
    const formattedNumber = nextNumber.toString().padStart(5, "0")

    return `S-${formattedNumber}`
  } catch (error) {
    console.error("Error generating sale number:", error)
    // في حالة الخطأ، أرجع رقم افتراضي
    return `S-${Date.now().toString().slice(-5)}`
  }
}

// ============================================================
// Get Inventory Items by Store
// ============================================================

export async function getInventoryByStore(storeId: string): Promise<InventoryItem[]> {
  try {
    const { data, error } = await supabase
      .from("tb_inventory")
      .select("*")
      .eq("storeid", storeId)
      .gt("quantity", 0) // فقط المواد المتوفرة
      .order("productname")

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching inventory:", error)
    return []
  }
}

// ============================================================
// Create Sale
// ============================================================

export async function createSale(
  saleMain: SaleMain,
  saleDetails: SaleDetail[],
  storeId: string,
  payType: "نقدي" | "آجل",
  currencyType: "دينار" | "دولار"
): Promise<{ success: boolean; saleId?: string; error?: string }> {
  try {
    console.log("Creating sale with data:", { saleMain, saleDetails, storeId, payType, currencyType })
    
    // 1) إدخال السجل الرئيسي
    const { data: mainData, error: mainError } = await supabase
      .from("tb_salesmain")
      .insert([saleMain])
      .select()
      .single()

    console.log("Insert result:", { mainData, mainError })

    if (mainError) throw mainError

    const saleMainId = mainData.id

    // 2) إدخال تفاصيل المبيعات (استبعاد tempId)
    const detailsWithMainId = saleDetails.map((d) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { tempId, ...detailData } = d as SaleProductRow
      return {
        ...detailData,
        salemainid: saleMainId,
      }
    })

    const { error: detailsError } = await supabase
      .from("tb_salesdetails")
      .insert(detailsWithMainId)

    console.log("Details insert result:", { detailsError })
    if (detailsError) throw detailsError

    // 3) تحديث المخزون (تنقيص الكميات المباعة)
    console.log("Starting inventory reduction...")
    for (const detail of saleDetails) {
      console.log("Reducing inventory for:", detail.productcode, "qty:", detail.quantity)
      await reduceInventoryQuantity(
        storeId,
        detail.productcode,
        detail.quantity
      )
    }
    console.log("Inventory reduction completed")

    // 4) تحديث رصيد الزبون (فقط إذا كان نوع الدفع آجل)
    console.log("Checking payment type:", payType)
    if (payType === "آجل") {
      // حساب المبلغ المتبقي بعد خصم المبلغ الواصل
      const remainingIQD = saleMain.finaltotaliqd - saleMain.amountreceivediqd
      const remainingUSD = saleMain.finaltotalusd - saleMain.amountreceivedusd

      // تحديث الرصيد حسب نوع العملة المختار فقط (بالموجب - دين له علينا)
      const balanceIQD = currencyType === "دينار" ? remainingIQD : 0
      const balanceUSD = currencyType === "دولار" ? remainingUSD : 0

      console.log("Updating customer balance:", { balanceIQD, balanceUSD })
      await updateCustomerBalance(
        saleMain.customerid,
        balanceIQD,
        balanceUSD
      )
      console.log("Customer balance updated")

      // 5) تسجيل الدفعة الواصلة إن وجدت
      if (saleMain.amountreceivediqd > 0 || saleMain.amountreceivedusd > 0) {
        const paymentNote = `دفعة واصلة لقائمة بيع ${saleMain.numberofsale} - ${saleMain.customername}`

        const { error: paymentError } = await supabase.from("payments").insert([{
          customer_id: saleMain.customerid,
          amount_iqd: saleMain.amountreceivediqd,
          amount_usd: saleMain.amountreceivedusd,
          currency_type: saleMain.amountreceivediqd > 0 ? 'IQD' : 'USD',
          transaction_type: "قبض",
          notes: paymentNote,
          pay_date: new Date().toISOString(),
          salesmainid: saleMainId,
          paymentamountiqd: saleMain.amountreceivediqd,
          paymentamountusd: saleMain.amountreceivedusd,
          paymenttype: "قبض",
        }])

        if (paymentError) {
          console.error("Payment insert error:", paymentError)
          throw paymentError
        }
      }
    }

    return { success: true, saleId: saleMainId }
  } catch (error) {
    console.error("=== ERROR CAUGHT ===")
    console.error("Error creating sale:", error)
    console.error("Error type:", typeof error)
    console.error("Error constructor:", error?.constructor?.name)
    
    // محاولة الحصول على معلومات أكثر
    if (error && typeof error === 'object') {
      console.error("Error keys:", Object.keys(error))
      console.error("Error entries:", Object.entries(error))
      for (const [key, value] of Object.entries(error)) {
        console.error(`  ${key}:`, value)
      }
    }
    
    console.error("Error details:", JSON.stringify(error, null, 2))
    console.error("Error string:", String(error))
    console.error("===================")
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : (error && typeof error === 'object' && 'message' in error)
        ? String(error.message)
        : String(error)
    
    return { success: false, error: errorMessage }
  }
}

// ============================================================
// Reduce Inventory Quantity
// ============================================================

async function reduceInventoryQuantity(
  storeId: string,
  productCode: string,
  quantitySold: number
): Promise<void> {
  try {
    console.log(`Attempting to reduce inventory: store=${storeId}, product=${productCode}, qty=${quantitySold}`)
    
    // جلب المادة الحالية
    const { data: item, error: fetchError } = await supabase
      .from("tb_inventory")
      .select("*")
      .eq("storeid", storeId)
      .eq("productcode", productCode)
      .single()

    console.log("Inventory fetch result:", { item, fetchError })

    if (fetchError) {
      console.error("Fetch error details:", fetchError)
      throw new Error(`خطأ في جلب المادة: ${fetchError.message || JSON.stringify(fetchError)}`)
    }

    if (!item) {
      throw new Error(`المادة ${productCode} غير موجودة في المخزن`)
    }

    // التحقق من توفر الكمية
    if (item.quantity < quantitySold) {
      throw new Error(`الكمية المتوفرة من ${item.productname} غير كافية. المتوفر: ${item.quantity}`)
    }

    // تحديث الكمية
    const newQuantity = item.quantity - quantitySold

    const { error: updateError } = await supabase
      .from("tb_inventory")
      .update({ quantity: newQuantity })
      .eq("id", item.id)

    if (updateError) {
      console.error("Update error details:", updateError)
      throw new Error(`خطأ في تحديث الكمية: ${updateError.message || JSON.stringify(updateError)}`)
    }
    
    console.log(`Successfully reduced inventory for ${productCode}`)
  } catch (error) {
    console.error("Error reducing inventory:", error)
    throw error
  }
}

// ============================================================
// Update Customer Balance
// ============================================================

async function updateCustomerBalance(
  customerId: string,
  additionalIQD: number,
  additionalUSD: number
): Promise<void> {
  try {
    console.log(`Updating customer balance: id=${customerId}, IQD=${additionalIQD}, USD=${additionalUSD}`)
    
    // جلب الرصيد الحالي
    const { data: customer, error: fetchError } = await supabase
      .from("customers")
      .select("balanceiqd, balanceusd")
      .eq("id", customerId)
      .single()

    console.log("Customer fetch result:", { customer, fetchError })

    if (fetchError) {
      console.error("Customer fetch error:", fetchError)
      throw new Error(`خطأ في جلب بيانات الزبون: ${fetchError.message || JSON.stringify(fetchError)}`)
    }

    // تحديث الرصيد (إضافة الرصيد الجديد)
    const { error: updateError } = await supabase
      .from("customers")
      .update({
        balanceiqd: (customer.balanceiqd || 0) + additionalIQD,
        balanceusd: (customer.balanceusd || 0) + additionalUSD,
        updated_at: new Date().toISOString()
      })
      .eq("id", customerId)

    console.log("Customer update result:", { updateError })

    if (updateError) {
      console.error("Customer update error:", updateError)
      throw new Error(`خطأ في تحديث رصيد الزبون: ${updateError.message || JSON.stringify(updateError)}`)
    }
    
    console.log("Customer balance updated successfully")
  } catch (error) {
    console.error("Error updating customer balance:", error)
    throw error
  }
}

// ============================================================
// Get All Sales
// ============================================================

export async function getAllSales(): Promise<SaleMain[]> {
  try {
    const { data, error } = await supabase
      .from("tb_salesmain")
      .select(`
        *,
        tb_store (
          storename
        ),
        customers (
          customer_name
        )
      `)
      .order("datetime", { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching sales:", error)
    return []
  }
}

// ============================================================
// Get Sale Details
// ============================================================

export async function getSaleDetails(saleMainId: string): Promise<SaleDetail[]> {
  try {
    const { data, error } = await supabase
      .from("tb_salesdetails")
      .select("*")
      .eq("salemainid", saleMainId)
      .order("productname")

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching sale details:", error)
    return []
  }
}
