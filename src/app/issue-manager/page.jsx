'use client';
import { redirect } from 'next/navigation';

export default function AdminPage() {
  // إعادة توجيه إلى لوحة التحكم افتراضياً
  redirect('/issue-manager/dashboard');
}