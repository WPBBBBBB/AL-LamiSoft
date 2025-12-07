-- تعطيل RLS لجدول المبيعات
-- نفذ هذا الكود في SQL Editor في Supabase

-- تعطيل RLS للجداول المتعلقة بالمبيعات
ALTER TABLE tb_salesmain DISABLE ROW LEVEL SECURITY;
ALTER TABLE tb_salesdetails DISABLE ROW LEVEL SECURITY;

-- حذف أي سياسات RLS قديمة
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON tb_salesmain;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON tb_salesmain;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON tb_salesmain;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON tb_salesmain;

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON tb_salesdetails;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON tb_salesdetails;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON tb_salesdetails;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON tb_salesdetails;

-- الآن يمكنك إضافة المبيعات بدون مشاكل RLS!
