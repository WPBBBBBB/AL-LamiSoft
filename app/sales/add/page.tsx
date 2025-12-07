"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { ArrowRight, Trash2, Loader2, Save, Eye, Plus } from "lucide-react"
import { toast } from "sonner"
import { getActiveStores, type Store } from "@/lib/stores-operations"
import {
  getAllCustomers,
  getInventoryByStore,
  createSale,
  type Customer,
  type InventoryItem,
  type SaleProductRow,
  type SaleMain,
} from "@/lib/sales-operations"
import { getCurrentExchangeRate } from "@/lib/exchange-rate-operations"

export default function SaleAddPage() {
  const router = useRouter()

  // ============================================================
  // State Management
  // ============================================================

  // البيانات الأساسية
  const [numberofsale, setNumberOfSale] = useState("")
  const [pricetype, setPriceType] = useState<"جملة" | "مفرد">("مفرد")
  const [paytype, setPayType] = useState<"نقدي" | "آجل">("نقدي")
  const [currencyType, setCurrencyType] = useState<"دينار" | "دولار">("دينار")
  const [salestoreid, setSaleStoreId] = useState("")
  const [datetime, setDateTime] = useState("")
  const [details, setDetails] = useState("")

  // بيانات الزبون
  const [customerid, setCustomerId] = useState("")
  const [customername, setCustomerName] = useState("")
  const [customerBalanceIQD, setCustomerBalanceIQD] = useState(0)
  const [customerBalanceUSD, setCustomerBalanceUSD] = useState(0)

  // المبلغ الواصل
  const [hasAmountReceived, setHasAmountReceived] = useState(false)
  const [amountCurrency, setAmountCurrency] = useState<"دينار" | "دولار">("دينار")
  const [amountReceivedIQD, setAmountReceivedIQD] = useState(0)
  const [amountReceivedUSD, setAmountReceivedUSD] = useState(0)

  // الخصم
  const [discountEnabled, setDiscountEnabled] = useState(false)
  const [discountCurrency, setDiscountCurrency] = useState<"دينار" | "دولار">("دينار")
  const [discountIQD, setDiscountIQD] = useState(0)
  const [discountUSD, setDiscountUSD] = useState(0)

  // القوائم المنسدلة
  const [stores, setStores] = useState<Store[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])

  // سعر الصرف
  const [exchangeRate, setExchangeRate] = useState(1500)

  // البحث في المنتجات
  const [productSearchCode, setProductSearchCode] = useState("")
  const [productSearchName, setProductSearchName] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestionPosition, setSuggestionPosition] = useState({ top: 0, left: 0 })
  const [isMounted, setIsMounted] = useState(false)
  const codeInputRef = useRef<HTMLInputElement>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)

  // جدول المنتجات
  const [products, setProducts] = useState<SaleProductRow[]>([])

  // صف الإضافة الجديد
  const [newItem, setNewItem] = useState<SaleProductRow>({
    tempId: "new-item",
    productcode: "",
    productname: "",
    storeid: "",
    quantity: 0,
    unitpriceiqd: 0,
    unitpriceusd: 0,
    totalpriceiqd: 0,
    totalpriceusd: 0,
    notes: "",
  })

  // حالة الحفظ
  const [isSaving, setIsSaving] = useState(false)

  // معاينة الملاحظات
  const [viewingNote, setViewingNote] = useState<string | null>(null)

  // ============================================================
  // Load Initial Data
  // ============================================================

  useEffect(() => {
    setIsMounted(true)
    loadInitialData()
    generateSaleNumber()
    // تعيين التاريخ الحالي
    const now = new Date()
    setDateTime(now.toISOString().slice(0, 16))
  }, [])

  useEffect(() => {
    if (salestoreid) {
      loadInventory(salestoreid)
    }
  }, [salestoreid])

  // إغلاق الاقتراحات عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      // تحقق إذا كان النقر خارج الـ input والاقتراحات
      if (
        codeInputRef.current && !codeInputRef.current.contains(target) &&
        nameInputRef.current && !nameInputRef.current.contains(target) &&
        !target.closest('[data-suggestions]')
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadInitialData = async () => {
    try {
      const [storesData, customersData, rate] = await Promise.all([
        getActiveStores(),
        getAllCustomers(),
        getCurrentExchangeRate(),
      ])

      setStores(storesData)
      setCustomers(customersData)
      setExchangeRate(rate)

      // تعيين المخزن الأول افتراضياً
      if (storesData.length > 0) {
        setSaleStoreId(storesData[0].id)
      }
    } catch (error) {
      console.error("Error loading data:", error)
      toast.error("فشل تحميل البيانات")
    }
  }

  const generateSaleNumber = async () => {
    try {
      const { generateNextSaleNumber } = await import("@/lib/sales-operations")
      const newNumber = await generateNextSaleNumber()
      setNumberOfSale(newNumber)
    } catch (error) {
      console.error("Error generating sale number:", error)
      toast.error("فشل توليد رقم القائمة")
    }
  }

  const loadInventory = async (storeId: string) => {
    try {
      console.log("🔍 Loading inventory for store:", storeId)
      const items = await getInventoryByStore(storeId)
      console.log("✅ Loaded inventory items:", items.length, "items:", items)
      setInventory(items)
      if (items.length === 0) {
        toast.info("لا توجد مواد متوفرة في هذا المخزن")
      } else {
        toast.success(`تم تحميل ${items.length} مادة من المخزن`)
      }
    } catch (error) {
      console.error("❌ Error loading inventory:", error)
      toast.error("فشل تحميل المواد")
    }
  }

  // ============================================================
  // Customer Selection
  // ============================================================

  const handleCustomerChange = async (customerId: string) => {
    setCustomerId(customerId)
    const customer = customers.find((c) => c.id === customerId)

    if (customer) {
      setCustomerName(customer.customer_name)
      setCustomerBalanceIQD(customer.balanceiqd ?? 0)
      setCustomerBalanceUSD(customer.balanceusd ?? 0)
    }
  }

  // ============================================================
  // Product Management
  // ============================================================

  // تصفية المنتجات حسب البحث
  const filteredInventory = inventory.filter((item) => {
    const searchCode = productSearchCode.toLowerCase().trim()
    const searchName = productSearchName.toLowerCase().trim()
    
    // إذا كان البحث بالرمز
    if (searchCode) {
      const matches = item.productcode.toLowerCase().includes(searchCode)
      return matches
    }
    
    // إذا كان البحث بالاسم
    if (searchName) {
      const matches = item.productname.toLowerCase().includes(searchName)
      return matches
    }
    
    return false
  })
  
  // تسجيل الحالة الحالية
  console.log("🔥 CURRENT STATE:", {
    inventory: inventory.length,
    productSearchCode,
    productSearchName,
    filteredInventory: filteredInventory.length,
    showSuggestions,
    suggestionPosition
  })

  const updateSuggestionPosition = (inputRef: React.RefObject<HTMLInputElement | null>) => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect()
      const newPosition = {
        top: rect.bottom + window.scrollY + 2,
        left: rect.left + window.scrollX,
      }
      console.log("📍 Updating position:", newPosition, "from rect:", rect)
      setSuggestionPosition(newPosition)
    } else {
      console.warn("⚠️ Input ref is null, using default position")
    }
  }

  const handleProductSearchCodeChange = (value: string) => {
    console.log("🔍 Search code changed:", value, "Inventory count:", inventory.length)
    setProductSearchCode(value)
    setProductSearchName("") // مسح حقل الاسم
    
    // تحديث الموقع أولاً
    setTimeout(() => updateSuggestionPosition(codeInputRef), 10)
    
    if (value.trim()) {
      setShowSuggestions(true)
      console.log("✅ Showing suggestions for code:", value)
    } else {
      setShowSuggestions(false)
    }
  }

  const handleProductSearchNameChange = (value: string) => {
    console.log("🔍 Search name changed:", value, "Inventory count:", inventory.length)
    setProductSearchName(value)
    setProductSearchCode("") // مسح حقل الرمز
    
    // تحديث الموقع أولاً
    setTimeout(() => updateSuggestionPosition(nameInputRef), 10)
    
    if (value.trim()) {
      setShowSuggestions(true)
      console.log("✅ Showing suggestions for name:", value)
    } else {
      setShowSuggestions(false)
    }
  }

  const selectProduct = (item: InventoryItem) => {
    console.log("Product selected:", item)
    setProductSearchCode(item.productcode)
    setProductSearchName(item.productname)
    setShowSuggestions(false)
    
    setNewItem({
      ...newItem,
      productcode: item.productcode,
      productname: item.productname,
      storeid: salestoreid,
      unitpriceiqd: item.sellpriceiqd,
      unitpriceusd: item.sellpriceusd,
    })
  }

  const addItemFromNew = () => {
    if (!newItem.productcode.trim() || !newItem.productname.trim()) {
      toast.error("الرجاء اختيار المادة")
      return
    }

    if (newItem.quantity <= 0) {
      toast.error("الرجاء إدخال كمية صحيحة")
      return
    }

    // التحقق من توفر الكمية في المخزن
    const inventoryItem = inventory.find((i) => i.productcode === newItem.productcode)
    if (inventoryItem && newItem.quantity > inventoryItem.quantity) {
      toast.error(`الكمية المتوفرة: ${inventoryItem.quantity} فقط`)
      return
    }

    const newProduct: SaleProductRow = {
      ...newItem,
      tempId: Date.now().toString(),
      totalpriceiqd: newItem.quantity * newItem.unitpriceiqd,
      totalpriceusd: newItem.quantity * newItem.unitpriceusd,
    }

    setProducts([...products, newProduct])
    toast.success("تمت إضافة المادة")

    // إعادة تعيين newItem والبحث
    setProductSearchCode("")
    setProductSearchName("")
    setShowSuggestions(false)
    
    setNewItem({
      tempId: "new-item",
      productcode: "",
      productname: "",
      storeid: salestoreid,
      quantity: 0,
      unitpriceiqd: 0,
      unitpriceusd: 0,
      totalpriceiqd: 0,
      totalpriceusd: 0,
      notes: "",
    })
  }

  const updateNewItem = (field: keyof SaleProductRow, value: string | number) => {
    const updated = { ...newItem, [field]: value }

    // حساب الإجمالي عند تغيير الكمية أو السعر
    if (field === "quantity" || field === "unitpriceiqd" || field === "unitpriceusd") {
      updated.totalpriceiqd = updated.quantity * updated.unitpriceiqd
      updated.totalpriceusd = updated.quantity * updated.unitpriceusd
    }

    // تحويل تلقائي بين العملات (مع التقريب لرقمين عشريين)
    if (field === "unitpriceiqd" && exchangeRate > 0) {
      updated.unitpriceusd = Math.round((Number(value) / exchangeRate) * 100) / 100
      updated.totalpriceusd = updated.quantity * updated.unitpriceusd
    }
    if (field === "unitpriceusd" && exchangeRate > 0) {
      updated.unitpriceiqd = Math.round((Number(value) * exchangeRate) * 100) / 100
      updated.totalpriceiqd = updated.quantity * updated.unitpriceiqd
    }

    setNewItem(updated)
  }

  const handleNewItemKeyPress = (e: React.KeyboardEvent, field: keyof SaleProductRow) => {
    if (e.key === "Enter") {
      e.preventDefault()
      
      // إضافة الصف الحالي إلى الجدول وبدء صف جديد
      if (newItem.productcode && newItem.quantity > 0) {
        addItemFromNew()
      }
    }
  }

  const updateProduct = (tempId: string, field: keyof SaleProductRow, value: string | number) => {
    setProducts(
      products.map((p) => {
        if (p.tempId === tempId) {
          const updated = { ...p, [field]: value }

          // حساب الإجمالي
          if (field === "quantity" || field === "unitpriceiqd" || field === "unitpriceusd") {
            updated.totalpriceiqd = updated.quantity * updated.unitpriceiqd
            updated.totalpriceusd = updated.quantity * updated.unitpriceusd
          }

          // تحويل تلقائي بين العملات (مع التقريب لرقمين عشريين)
          if (field === "unitpriceiqd" && exchangeRate > 0) {
            updated.unitpriceusd = Math.round((Number(value) / exchangeRate) * 100) / 100
            updated.totalpriceusd = updated.quantity * updated.unitpriceusd
          }
          if (field === "unitpriceusd" && exchangeRate > 0) {
            updated.unitpriceiqd = Math.round((Number(value) * exchangeRate) * 100) / 100
            updated.totalpriceiqd = updated.quantity * updated.unitpriceiqd
          }

          return updated
        }
        return p
      })
    )
  }

  const deleteProduct = (tempId: string) => {
    setProducts(products.filter((p) => p.tempId !== tempId))
    toast.success("تم حذف المادة")
  }

  // ============================================================
  // Calculations
  // ============================================================

  const totalProductsCount = products.filter((p) => p.productcode && p.quantity > 0).length

  const totalSaleIQD = products.reduce((sum, p) => sum + (p.totalpriceiqd || 0), 0)
  const totalSaleUSD = products.reduce((sum, p) => sum + (p.totalpriceusd || 0), 0)

  // المبلغ بعد الخصم
  const afterDiscountIQD = totalSaleIQD - (discountEnabled ? discountIQD : 0)
  const afterDiscountUSD = totalSaleUSD - (discountEnabled ? discountUSD : 0)

  // المبلغ النهائي (بعد الخصم وبعد خصم المبلغ الواصل)
  const finalTotalIQD = afterDiscountIQD - amountReceivedIQD
  const finalTotalUSD = afterDiscountUSD - amountReceivedUSD

  // ============================================================
  // Amount Received Handler
  // ============================================================

  const handleAmountReceivedChange = (value: number) => {
    if (amountCurrency === "دينار") {
      setAmountReceivedIQD(value)
      setAmountReceivedUSD(0)
    } else {
      setAmountReceivedUSD(value)
      setAmountReceivedIQD(0)
    }
  }

  // ============================================================
  // Discount Handler
  // ============================================================

  const handleDiscountChange = (value: number) => {
    if (discountCurrency === "دينار") {
      setDiscountIQD(value)
      setDiscountUSD(0)
    } else {
      setDiscountUSD(value)
      setDiscountIQD(0)
    }
  }

  // ============================================================
  // Save Sale
  // ============================================================

  const handleSaveSale = async () => {
    // التحقق من البيانات
    if (!numberofsale.trim()) {
      toast.error("الرجاء إدخال رقم القائمة")
      return
    }

    if (!salestoreid) {
      toast.error("الرجاء اختيار المخزن")
      return
    }

    if (!customerid) {
      toast.error("الرجاء اختيار الزبون")
      return
    }

    const validProducts = products.filter((p) => p.productcode && p.quantity > 0)

    if (validProducts.length === 0) {
      toast.error("الرجاء إضافة مادة واحدة على الأقل")
      return
    }

    setIsSaving(true)

    try {
      const saleMain: SaleMain = {
        numberofsale,
        salestoreid,
        customerid,
        customername,
        pricetype,
        paytype,
        currencytype: currencyType,
        details,
        datetime,
        discountenabled: discountEnabled,
        discountcurrency: discountEnabled ? discountCurrency : undefined,
        discountiqd: discountIQD,
        discountusd: discountUSD,
        totalsaleiqd: totalSaleIQD,
        totalsaleusd: totalSaleUSD,
        amountreceivediqd: amountReceivedIQD,
        amountreceivedusd: amountReceivedUSD,
        finaltotaliqd: afterDiscountIQD,
        finaltotalusd: afterDiscountUSD,
      }

      console.log("=== BEFORE CALLING createSale ===")
      console.log("saleMain:", saleMain)
      console.log("validProducts:", validProducts)
      console.log("salestoreid:", salestoreid)
      console.log("paytype:", paytype)
      console.log("currencyType:", currencyType)
      console.log("================================")

      const result = await createSale(
        saleMain,
        validProducts,
        salestoreid,
        paytype,
        currencyType
      )

      console.log("=== AFTER createSale ===")
      console.log("result:", result)

      if (result.success) {
        toast.success("تم حفظ قائمة البيع بنجاح")

        // تصفير الجدول والنموذج للبدء بقائمة جديدة
        setProducts([])
        setDetails("")
        setHasAmountReceived(false)
        setAmountReceivedIQD(0)
        setAmountReceivedUSD(0)
        setDiscountEnabled(false)
        setDiscountIQD(0)
        setDiscountUSD(0)
        setDateTime(new Date().toISOString().slice(0, 16))
        
        // توليد رقم قائمة جديد
        generateSaleNumber()

        // إعادة تعيين newItem وحقول البحث
        setProductSearchCode("")
        setProductSearchName("")
        setShowSuggestions(false)
        
        setNewItem({
          tempId: "new-item",
          productcode: "",
          productname: "",
          storeid: salestoreid,
          quantity: 0,
          unitpriceiqd: 0,
          unitpriceusd: 0,
          totalpriceiqd: 0,
          totalpriceusd: 0,
          notes: "",
        })

        // إعادة تحميل المخزون
        if (salestoreid) {
          loadInventory(salestoreid)
        }
      } else {
        toast.error(result.error || "فشل حفظ قائمة البيع")
      }
    } catch (error) {
      console.error("Error saving sale:", error)
      toast.error("حدث خطأ أثناء حفظ القائمة")
    } finally {
      setIsSaving(false)
    }
  }

  // ============================================================
  // Render
  // ============================================================

  return (
    <>
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-foreground">
            إضافة قائمة بيع
          </h1>
        </div>
      </div>

      {/* Form Card */}
      <Card className="p-6">
        {/* الصف الأول */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          {/* رقم القائمة */}
          <div className="space-y-2">
            <Label htmlFor="numberofsale">رقم القائمة (تلقائي)</Label>
            <Input
              id="numberofsale"
              value={numberofsale}
              readOnly
              className="bg-muted font-semibold"
              placeholder="S-00001"
            />
          </div>

          {/* نوع التسعير */}
          <div className="space-y-2">
            <Label>نوع التسعير</Label>
            <Select value={pricetype} onValueChange={(v: "جملة" | "مفرد") => setPriceType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="مفرد">مفرد</SelectItem>
                <SelectItem value="جملة">جملة</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* نوع الدفع */}
          <div className="space-y-2">
            <Label>نوع الدفع</Label>
            <Select value={paytype} onValueChange={(v: "نقدي" | "آجل") => setPayType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="نقدي">نقدي</SelectItem>
                <SelectItem value="آجل">آجل</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* نوع العملة */}
          <div className="space-y-2">
            <Label>نوع العملة</Label>
            <Select
              value={currencyType}
              onValueChange={(v: "دينار" | "دولار") => setCurrencyType(v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="دينار">دينار</SelectItem>
                <SelectItem value="دولار">دولار</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* سعر الصرف */}
          <div className="space-y-2">
            <Label>سعر الصرف الحالي</Label>
            <div className="flex items-center h-10 px-3 rounded-md border bg-muted">
              <span className="font-semibold text-lg">{exchangeRate.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* الصف الثاني - الزبون والمخزن */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
          {/* اسم الزبون */}
          <div className="space-y-2 md:col-span-3">
            <Label>اسم الزبون</Label>
            <Select value={customerid} onValueChange={handleCustomerChange}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الزبون" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.customer_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* رصيد الزبون السابق دينار */}
          <div className="space-y-2 md:col-span-2">
            <Label className="font-semibold text-blue-600 dark:text-blue-400">
              رصيد سابق دينار
            </Label>
            <div className="flex items-center h-10 px-3 rounded-md border bg-muted">
              <span className="font-semibold text-lg">
                {customerBalanceIQD.toLocaleString()}
              </span>
            </div>
          </div>

          {/* رصيد الزبون السابق دولار */}
          <div className="space-y-2 md:col-span-2">
            <Label className="font-semibold text-green-600 dark:text-green-400">
              رصيد سابق دولار
            </Label>
            <div className="flex items-center h-10 px-3 rounded-md border bg-muted">
              <span className="font-semibold text-lg">
                {customerBalanceUSD.toLocaleString()}
              </span>
            </div>
          </div>

          {/* المخزن */}
          <div className="space-y-2 md:col-span-3">
            <Label>المخزن</Label>
            <Select value={salestoreid} onValueChange={setSaleStoreId}>
              <SelectTrigger>
                <SelectValue placeholder="اختر المخزن" />
              </SelectTrigger>
              <SelectContent>
                {stores.map((store) => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.storename}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Checkbox مبلغ واصل - يظهر فقط عند الآجل */}
          {paytype === "آجل" && (
            <div className="space-y-2 flex items-end">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="hasAmountReceived"
                  checked={hasAmountReceived}
                  onCheckedChange={(checked) => {
                    setHasAmountReceived(!!checked)
                    if (!checked) {
                      setAmountReceivedIQD(0)
                      setAmountReceivedUSD(0)
                    }
                  }}
                />
                <Label htmlFor="hasAmountReceived" className="cursor-pointer">
                  مبلغ واصل
                </Label>
              </div>
            </div>
          )}
        </div>

        {/* صف المبلغ الواصل */}
        {hasAmountReceived && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 rounded-lg bg-accent/50">
            <div className="space-y-2">
              <Label>عملة المبلغ الواصل</Label>
              <Select
                value={amountCurrency}
                onValueChange={(v: "دينار" | "دولار") => {
                  setAmountCurrency(v)
                  setAmountReceivedIQD(0)
                  setAmountReceivedUSD(0)
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="دينار">دينار</SelectItem>
                  <SelectItem value="دولار">دولار</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>المبلغ الواصل</Label>
              <Input
                type="number"
                value={
                  amountCurrency === "دينار" ? amountReceivedIQD : amountReceivedUSD
                }
                onChange={(e) => handleAmountReceivedChange(parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
          </div>
        )}

        {/* الصف الثالث - التاريخ والملاحظات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="space-y-2">
            <Label>تاريخ العملية</Label>
            <Input
              type="datetime-local"
              value={datetime}
              onChange={(e) => setDateTime(e.target.value)}
            />
          </div>

          <div className="space-y-2 md:col-span-3">
            <Label>ملاحظات</Label>
            <Textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="ملاحظات إضافية"
              rows={2}
            />
          </div>
        </div>

        {/* الخصم */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Checkbox
              id="discountEnabled"
              checked={discountEnabled}
              onCheckedChange={(checked) => {
                setDiscountEnabled(!!checked)
                if (!checked) {
                  setDiscountIQD(0)
                  setDiscountUSD(0)
                }
              }}
            />
            <Label htmlFor="discountEnabled" className="cursor-pointer font-semibold">
              تفعيل الخصم
            </Label>
          </div>

          {discountEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-lg bg-accent/50">
              <div className="space-y-2">
                <Label>عملة الخصم</Label>
                <Select
                  value={discountCurrency}
                  onValueChange={(v: "دينار" | "دولار") => {
                    setDiscountCurrency(v)
                    setDiscountIQD(0)
                    setDiscountUSD(0)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="دينار">دينار</SelectItem>
                    <SelectItem value="دولار">دولار</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>مبلغ الخصم</Label>
                <Input
                  type="number"
                  value={discountCurrency === "دينار" ? discountIQD : discountUSD}
                  onChange={(e) => handleDiscountChange(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
            </div>
          )}
        </div>

        {/* Summary Footer - نقله للأعلى */}
        <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: "var(--theme-surface)", borderLeft: "4px solid var(--theme-primary)" }}>
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium" style={{ color: "var(--theme-text)" }}>عدد المواد:</span>
              <span className="font-bold text-lg" style={{ color: "var(--theme-text)" }}>{totalProductsCount}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm" style={{ color: "var(--theme-text)" }}>إجمالي دينار:</span>
              <span className="font-bold text-lg text-green-600 dark:text-green-400">
                {totalSaleIQD.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm" style={{ color: "var(--theme-text)" }}>إجمالي دولار:</span>
              <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
                {totalSaleUSD.toLocaleString()}
              </span>
            </div>

            {discountEnabled && (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-sm" style={{ color: "var(--theme-text)" }}>بعد الخصم دينار:</span>
                  <span className="font-bold text-lg text-purple-600 dark:text-purple-400">
                    {afterDiscountIQD.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm" style={{ color: "var(--theme-text)" }}>بعد الخصم دولار:</span>
                  <span className="font-bold text-lg text-purple-600 dark:text-purple-400">
                    {afterDiscountUSD.toLocaleString()}
                  </span>
                </div>
              </>
            )}

            {hasAmountReceived && (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-sm" style={{ color: "var(--theme-text)" }}>واصل دينار:</span>
                  <span className="font-bold text-lg" style={{ color: "var(--theme-text)" }}>{amountReceivedIQD.toLocaleString()}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm" style={{ color: "var(--theme-text)" }}>واصل دولار:</span>
                  <span className="font-bold text-lg" style={{ color: "var(--theme-text)" }}>{amountReceivedUSD.toLocaleString()}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm" style={{ color: "var(--theme-text)" }}>المتبقي دينار:</span>
                  <span className="font-bold text-lg text-orange-600 dark:text-orange-400">
                    {finalTotalIQD.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm" style={{ color: "var(--theme-text)" }}>المتبقي دولار:</span>
                  <span className="font-bold text-lg text-orange-600 dark:text-orange-400">
                    {finalTotalUSD.toLocaleString()}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* جدول المواد - التصميم الجديد مثل صفحة الشراء */}
        <div className="mt-6 space-y-2">
          {/* Debug info */}
          <div className="text-xs bg-muted/50 p-2 rounded space-y-1">
            <div className="flex gap-4 flex-wrap">
              <span className={inventory.length > 0 ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                📦 عدد المواد في المخزن: {inventory.length}
              </span>
              <span className={filteredInventory.length > 0 ? "text-green-600 font-bold" : "text-orange-600"}>
                🔍 نتائج البحث: {filteredInventory.length}
              </span>
              <span className={showSuggestions ? "text-green-600 font-bold" : "text-gray-500"}>
                👁️ إظهار الاقتراحات: {showSuggestions ? "نعم ✅" : "لا ❌"}
              </span>
            </div>
            <div className="flex gap-4">
              <span className="text-muted-foreground">
                🔤 رمز البحث: <span className="font-mono bg-yellow-100 dark:bg-yellow-900 px-1">"{productSearchCode}"</span>
              </span>
              <span className="text-muted-foreground">
                📝 اسم البحث: <span className="font-mono bg-yellow-100 dark:bg-yellow-900 px-1">"{productSearchName}"</span>
              </span>
            </div>
            {inventory.length === 0 && (
              <div className="text-red-600 font-bold mt-2">
                ⚠️ تحذير: المخزون فارغ! اختر مخزنًا أولاً.
              </div>
            )}
            {inventory.length > 0 && filteredInventory.length === 0 && (productSearchCode || productSearchName) && (
              <div className="text-orange-600 font-bold mt-2">
                ⚠️ لا توجد نتائج مطابقة للبحث.
              </div>
            )}
          </div>
          
          <div className="rounded-lg border overflow-x-auto w-full max-h-[calc(100vh-500px)] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow
                style={{
                  background: "linear-gradient(to right, var(--theme-surface), var(--theme-accent))",
                }}
              >
                <TableHead className="text-center" style={{ color: "var(--theme-text)" }}>#</TableHead>
                <TableHead className="text-center" style={{ color: "var(--theme-text)" }}>حذف</TableHead>
                <TableHead className="text-right" style={{ color: "var(--theme-text)" }}>رمز المادة</TableHead>
                <TableHead className="text-right" style={{ color: "var(--theme-text)" }}>اسم المادة</TableHead>
                <TableHead className="text-right" style={{ color: "var(--theme-text)" }}>الكمية</TableHead>
                <TableHead className="text-right" style={{ color: "var(--theme-text)" }}>س. مفرد دينار</TableHead>
                <TableHead className="text-right" style={{ color: "var(--theme-text)" }}>س. مفرد دولار</TableHead>
                <TableHead className="text-right" style={{ color: "var(--theme-text)" }}>إجمالي دينار</TableHead>
                <TableHead className="text-right" style={{ color: "var(--theme-text)" }}>إجمالي دولار</TableHead>
                <TableHead className="text-right" style={{ color: "var(--theme-text)" }}>ملاحظة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
            {/* صف الإضافة الجديد */}
            <TableRow style={{ backgroundColor: "var(--theme-accent)", opacity: 0.9 }}>
              <TableCell className="text-center font-bold" style={{ color: "var(--theme-text)" }}>
                جديد
              </TableCell>
                <TableCell className="text-center">
                  <Plus className="h-5 w-5 text-green-500 mx-auto" />
                </TableCell>
                <TableCell>
                  <div style={{ minWidth: '120px', width: '120px', position: 'relative' }}>
                    <Input
                      ref={codeInputRef}
                      value={productSearchCode}
                      onChange={(e) => handleProductSearchCodeChange(e.target.value)}
                      onFocus={() => {
                        setShowSuggestions(true)
                        updateSuggestionPosition(codeInputRef)
                      }}
                      placeholder="رمز المادة"
                      className="h-8 bg-green-50 dark:bg-green-950/20 text-foreground"
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <div style={{ minWidth: '150px', width: '150px', position: 'relative' }}>
                    <Input
                      ref={nameInputRef}
                      value={productSearchName}
                      onChange={(e) => handleProductSearchNameChange(e.target.value)}
                      onFocus={() => {
                        setShowSuggestions(true)
                        updateSuggestionPosition(nameInputRef)
                      }}
                      placeholder="اسم المادة"
                      className="h-8 bg-green-50 dark:bg-green-950/20 text-foreground"
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={newItem.quantity || ""}
                    onChange={(e) =>
                      updateNewItem("quantity", parseFloat(e.target.value) || 0)
                    }
                    onKeyPress={(e) => handleNewItemKeyPress(e, "quantity")}
                    placeholder="0"
                    className="h-8 bg-green-50 dark:bg-green-950/20 text-foreground"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={newItem.unitpriceiqd || ""}
                    onChange={(e) =>
                      updateNewItem("unitpriceiqd", parseFloat(e.target.value) || 0)
                    }
                    onKeyPress={(e) => handleNewItemKeyPress(e, "unitpriceiqd")}
                    placeholder="0"
                    className="h-8 bg-green-50 dark:bg-green-950/20 text-foreground"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={newItem.unitpriceusd || ""}
                    onChange={(e) =>
                      updateNewItem("unitpriceusd", parseFloat(e.target.value) || 0)
                    }
                    onKeyPress={(e) => handleNewItemKeyPress(e, "unitpriceusd")}
                    placeholder="0"
                    className="h-8 bg-green-50 dark:bg-green-950/20 text-foreground"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={newItem.totalpriceiqd.toFixed(2)}
                    readOnly
                    className="h-8 bg-muted text-foreground"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={newItem.totalpriceusd.toFixed(2)}
                    readOnly
                    className="h-8 bg-muted text-foreground"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={newItem.notes}
                    onChange={(e) => updateNewItem("notes", e.target.value)}
                    onKeyPress={(e) => handleNewItemKeyPress(e, "notes")}
                    placeholder="ملاحظة"
                    className="h-8 bg-green-50 dark:bg-green-950/20 text-foreground"
                  />
                </TableCell>
              </TableRow>

              {/* المواد المضافة */}
              {products.map((product, index) => (
                <TableRow key={product.tempId} className="bg-background">
                  <TableCell className="text-center text-foreground">{index + 1}</TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteProduct(product.tempId)}
                      className="h-8 w-8 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Input
                        value={product.productcode}
                        readOnly
                        className="flex-1 h-8 bg-muted text-center text-foreground"
                        title={product.productcode}
                      />
                      {product.productcode.length > 10 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setViewingNote(product.productcode)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Input
                        value={product.productname}
                        readOnly
                        className="flex-1 h-8 bg-muted text-foreground"
                        title={product.productname}
                      />
                      {product.productname.length > 15 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setViewingNote(product.productname)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={product.quantity}
                      onChange={(e) =>
                        updateProduct(
                          product.tempId,
                          "quantity",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="0"
                      className="h-8 text-foreground"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={product.unitpriceiqd}
                      onChange={(e) =>
                        updateProduct(
                          product.tempId,
                          "unitpriceiqd",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="0"
                      className="h-8 text-foreground"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={product.unitpriceusd}
                      onChange={(e) =>
                        updateProduct(
                          product.tempId,
                          "unitpriceusd",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="0"
                      className="h-8 text-foreground"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={product.totalpriceiqd.toFixed(2)}
                      readOnly
                      className="h-8 bg-muted text-foreground"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={product.totalpriceusd.toFixed(2)}
                      readOnly
                      className="h-8 bg-muted text-foreground"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Input
                        value={product.notes}
                        onChange={(e) =>
                          updateProduct(product.tempId, "notes", e.target.value)
                        }
                        placeholder="ملاحظة"
                        className="flex-1 h-8 text-foreground"
                        title={product.notes}
                      />
                      {product.notes && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setViewingNote(product.notes || "")}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </div>

        {/* زر الحفظ */}
        <div className="mt-6">
          <Button
            onClick={handleSaveSale}
            disabled={isSaving}
            size="lg"
            className="w-full md:w-auto"
            style={{ backgroundColor: "var(--theme-primary)", color: "white" }}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-5 w-5 ml-2 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 ml-2" />
                إضافة قائمة البيع
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Dialog عرض الملاحظة */}
      <Dialog open={viewingNote !== null} onOpenChange={(open) => !open && setViewingNote(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>التفاصيل</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="whitespace-pre-wrap">{viewingNote}</p>
          </div>
          <DialogFooter>
            <Button onClick={() => setViewingNote(null)}>إغلاق</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    
    {/* قائمة الاقتراحات - Portal خارج كل شيء */}
    {isMounted && showSuggestions && filteredInventory.length > 0 && createPortal(
      <div 
        data-suggestions="true"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9999999,
          width: '90vw',
          maxWidth: '1000px',
          maxHeight: '80vh',
          overflowY: 'auto',
          backgroundColor: 'var(--theme-background)',
          border: '5px solid var(--theme-primary)',
          borderRadius: '16px',
          boxShadow: '0 25px 80px rgba(0, 0, 0, 0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          background: 'linear-gradient(135deg, var(--theme-primary), var(--theme-accent))',
          color: 'var(--theme-background)',
          fontWeight: 'bold',
          fontSize: '20px',
          textAlign: 'center',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>🎯 الاقتراحات المتاحة ({filteredInventory.length})</span>
          <button
            onClick={() => setShowSuggestions(false)}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'var(--theme-background)',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            ✕ إغلاق
          </button>
        </div>
        
        {/* جدول الاقتراحات */}
        <div style={{ maxHeight: 'calc(80vh - 140px)', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
              <tr style={{ 
                background: 'linear-gradient(to right, var(--theme-surface), var(--theme-accent))',
                borderBottom: '2px solid var(--theme-primary)'
              }}>
                <th style={{ 
                  padding: '14px 16px', 
                  textAlign: 'right', 
                  fontWeight: 'bold',
                  color: 'var(--theme-text)',
                  fontSize: '15px'
                }}>رمز المادة</th>
                <th style={{ 
                  padding: '14px 16px', 
                  textAlign: 'right', 
                  fontWeight: 'bold',
                  color: 'var(--theme-text)',
                  fontSize: '15px'
                }}>اسم المادة</th>
                <th style={{ 
                  padding: '14px 16px', 
                  textAlign: 'center', 
                  fontWeight: 'bold',
                  color: 'var(--theme-text)',
                  fontSize: '15px'
                }}>س. دينار</th>
                <th style={{ 
                  padding: '14px 16px', 
                  textAlign: 'center', 
                  fontWeight: 'bold',
                  color: 'var(--theme-text)',
                  fontSize: '15px'
                }}>س. دولار</th>
                <th style={{ 
                  padding: '14px 16px', 
                  textAlign: 'center', 
                  fontWeight: 'bold',
                  color: 'var(--theme-text)',
                  fontSize: '15px'
                }}>المتوفر</th>
              </tr>
            </thead>
            <tbody>
            {filteredInventory.slice(0, 20).map((item, index) => (
              <tr
                key={item.productcode}
                style={{
                  backgroundColor: index % 2 === 0 ? 'var(--theme-background)' : 'var(--theme-surface)',
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--theme-border)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--theme-accent)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'var(--theme-background)' : 'var(--theme-surface)'
                }}
                onMouseDown={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log("🎯 Product selected:", item.productcode)
                  selectProduct(item)
                }}
              >
                <td style={{ 
                  padding: '12px 16px', 
                  fontWeight: 'bold', 
                  color: 'var(--theme-primary)',
                  fontSize: '14px'
                }}>
                  {item.productcode}
                </td>
                <td style={{ 
                  padding: '12px 16px', 
                  color: 'var(--theme-text)',
                  fontSize: '14px'
                }}>
                  {item.productname}
                </td>
                <td style={{ 
                  padding: '12px 16px', 
                  textAlign: 'center',
                  color: '#16a34a',
                  fontWeight: '600',
                  fontSize: '14px'
                }}>
                  {item.sellpriceiqd?.toLocaleString() || 0}
                </td>
                <td style={{ 
                  padding: '12px 16px', 
                  textAlign: 'center',
                  color: '#2563eb',
                  fontWeight: '600',
                  fontSize: '14px'
                }}>
                  {item.sellpriceusd?.toLocaleString() || 0}
                </td>
                <td style={{ 
                  padding: '12px 16px', 
                  textAlign: 'center',
                  color: '#ea580c',
                  fontWeight: '600',
                  fontSize: '14px'
                }}>
                  {item.quantity || 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        
        {/* Footer مع عدد النتائج */}
        <div style={{ 
          padding: '12px 20px', 
          background: 'linear-gradient(135deg, var(--theme-primary), var(--theme-accent))',
          color: 'var(--theme-background)',
          borderTop: '2px solid var(--theme-primary)',
          textAlign: 'center',
          fontSize: '14px',
          fontWeight: 'bold'
        }}>
          📊 عدد النتائج: {filteredInventory.length} | اضغط على أي صف للاختيار ⬇️
        </div>
      </div>,
      document.body
    )}

    {/* خلفية شبه شفافة عند ظهور الاقتراحات */}
    {isMounted && showSuggestions && filteredInventory.length > 0 && createPortal(
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9999998,
        }}
        onClick={() => setShowSuggestions(false)}
      />,
      document.body
    )}
    </>
  )
}
