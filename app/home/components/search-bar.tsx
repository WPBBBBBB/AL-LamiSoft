"use client"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { getCurrentExchangeRate, updateExchangeRate } from "@/lib/exchange-rate-operations"
import { getUsers } from "@/lib/users-operations"

export function SearchBar() {
  const [exchangeRate, setExchangeRate] = useState("1350")
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [customerResults, setCustomerResults] = useState<any[]>([])
  const [searchLoading, setSearchLoading] = useState(false)

  // تحميل سعر الصرف عند تحميل المكون
  useEffect(() => {
    loadExchangeRate()
  }, [])

  async function loadExchangeRate() {
    try {
      const rate = await getCurrentExchangeRate()
      setExchangeRate(rate.toString())
    } catch (error) {
      console.error("Error loading exchange rate:", error)
    }
  }

  const handleExchangeRateUpdate = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setIsEditing(false)
      setIsLoading(true)
      
      try {
        const rate = parseFloat(exchangeRate)
        if (isNaN(rate) || rate <= 0) {
          toast.error("الرجاء إدخال سعر صرف صحيح")
          await loadExchangeRate()
          return
        }

        await updateExchangeRate(rate, "user")
        toast.success("تم تحديث سعر الصرف بنجاح")
        await loadExchangeRate()
      } catch (error) {
        console.error("Error updating exchange rate:", error)
        toast.error("حدث خطأ أثناء تحديث سعر الصرف")
        await loadExchangeRate()
      } finally {
        setIsLoading(false)
      }
    }
  }

  // البحث عن زبون عند الكتابة
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchValue.trim().length < 2) {
        setCustomerResults([])
        return
      }
      setSearchLoading(true)
      try {
        const users = await getUsers()
        const filtered = users.filter(u =>
          u.full_name?.includes(searchValue) || u.username?.includes(searchValue)
        )
        setCustomerResults(filtered)
      } catch (err) {
        setCustomerResults([])
      } finally {
        setSearchLoading(false)
      }
    }, 400)
    return () => clearTimeout(delayDebounce)
  }, [searchValue])

  return (
    <div className="w-full space-y-4">
      <div className="relative flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="ابحث عن المنتجات، العملاء، الفواتير..."
            className="h-12 pr-10 text-base"
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
          />
          {/* نتائج البحث عن الزبون */}
          {searchValue.trim() && (
            <div className="absolute left-0 right-0 top-full z-10 bg-white border rounded shadow mt-1 max-h-60 overflow-y-auto">
              {searchLoading ? (
                <div className="p-2 text-center text-muted-foreground">جاري البحث...</div>
              ) : customerResults.length > 0 ? (
                customerResults.map(cust => (
                  <div key={cust.id} className="p-2 hover:bg-accent cursor-pointer text-right">
                    {cust.full_name} <span className="text-xs text-muted-foreground">({cust.phone_number})</span>
                  </div>
                ))
              ) : (
                <div className="p-2 text-center text-muted-foreground">لا يوجد نتائج</div>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">سعر الصرف:</span>
          {isEditing ? (
            <Input
              type="number"
              value={exchangeRate}
              onChange={(e) => setExchangeRate(e.target.value)}
              onKeyDown={handleExchangeRateUpdate}
              onBlur={() => setIsEditing(false)}
              className="h-10 w-32 text-center"
              autoFocus
            />
          ) : (
            <Badge
              variant="secondary"
              className="cursor-pointer px-4 py-2 text-sm font-semibold hover:bg-secondary/80"
              onClick={() => !isLoading && setIsEditing(true)}
            >
              {isLoading ? "جاري التحديث..." : `${exchangeRate} IQD`}
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}
