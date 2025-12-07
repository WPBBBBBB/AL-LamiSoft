"use client"

import { useState, useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getCustomers, createPayment, type Customer } from "@/lib/supabase-operations"
import { toast } from "sonner"

const formSchema = z.object({
  customer_id: z.string().min(1, { message: "يرجى اختيار الزبون" }),
  transaction_type: z.enum(["قبض", "ايداع", "سحب", "صرف", "قرض"]),
  currency_type: z.enum(["IQD", "USD"]),
  amount: z.string().min(1, { message: "يرجى إدخال المبلغ" }),
  notes: z.string().optional(),
})

interface PaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function PaymentModal({ open, onOpenChange, onSuccess }: PaymentModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectOpen, setSelectOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customer_id: "",
      transaction_type: "قبض",
      currency_type: "IQD",
      amount: "",
      notes: "",
    },
  })

  useEffect(() => {
    if (open) {
      loadCustomers()
      form.reset()
      setSearchQuery("")
      setSelectOpen(false)
    }
  }, [open])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setSelectOpen(false)
      }
    }
    if (selectOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [selectOpen])

  async function loadCustomers() {
    try {
      const data = await getCustomers()
      setCustomers(data)
    } catch (error) {
      console.error(error)
      toast.error("حدث خطأ أثناء تحميل العملاء")
    }
  }

  const filteredCustomers = customers.filter((customer) =>
    customer.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone_number?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true)

      const amount = parseFloat(values.amount)
      if (isNaN(amount) || amount <= 0) {
        toast.error("يرجى إدخال مبلغ صحيح")
        return
      }

      await createPayment({
        customer_id: values.customer_id,
        amount_iqd: values.currency_type === "IQD" ? amount : 0,
        amount_usd: values.currency_type === "USD" ? amount : 0,
        currency_type: values.currency_type,
        transaction_type: values.transaction_type,
        notes: values.notes || "",
        pay_date: new Date().toISOString(),
      })

      toast.success("تم تسجيل الدفعة بنجاح")
      onOpenChange(false)
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error(error)
      toast.error("حدث خطأ أثناء تسجيل الدفعة")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">تسجيل دفعة جديدة</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            {/* اختيار الزبون */}
            <FormField
              control={form.control}
              name="customer_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اختيار الزبون *</FormLabel>
                  <div className="relative" ref={dropdownRef}>
                    <Input
                      placeholder="ابحث عن زبون..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value)
                        setSelectOpen(true)
                      }}
                      onFocus={() => setSelectOpen(true)}
                      className="w-full"
                    />
                    {selectOpen && filteredCustomers.length > 0 && (
                      <div 
                        className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-[300px] overflow-y-auto"
                      >
                        {filteredCustomers.map((customer) => (
                          <div
                            key={customer.id}
                            onMouseDown={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              field.onChange(customer.id)
                              setSelectOpen(false)
                              setSearchQuery("")
                            }}
                            className="px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground flex flex-col"
                          >
                            <span>{customer.customer_name}</span>
                            {customer.phone_number && (
                              <span className="text-xs text-muted-foreground">
                                {customer.phone_number}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {selectOpen && filteredCustomers.length === 0 && searchQuery && (
                      <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md">
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          لم يتم العثور على زبون
                        </div>
                      </div>
                    )}
                    {field.value && (
                      <div className="mt-2 p-2 bg-muted rounded-md text-sm">
                        <span className="font-medium">المختار:</span>{" "}
                        {customers.find(c => c.id === field.value)?.customer_name}
                      </div>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* نوع العملة */}
            <FormField
              control={form.control}
              name="currency_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نوع العملة *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر العملة" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="IQD">دينار عراقي (IQD)</SelectItem>
                      <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* نوع العملية */}
            <FormField
              control={form.control}
              name="transaction_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نوع العملية *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع العملية" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="قبض">قبض</SelectItem>
                      <SelectItem value="ايداع">ايداع</SelectItem>
                      <SelectItem value="سحب">سحب</SelectItem>
                      <SelectItem value="صرف">صرف</SelectItem>
                      <SelectItem value="قرض">قرض</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* المبلغ */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>المبلغ *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="أدخل المبلغ"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملاحظات</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="أدخل أي ملاحظات..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* الأزرار */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "جاري الحفظ..." : "تسجيل الدفعة"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                className="flex-1"
              >
                إلغاء
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
