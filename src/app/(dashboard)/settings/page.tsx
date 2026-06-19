import { Settings as SettingsIcon, Globe, Bell, Shield } from 'lucide-react';
import { getDictionary } from "@/lib/dictionary";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role === "STAFF") redirect("/");
  const dict = await getDictionary();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">ການຕັ້ງຄ່າ</h1>
        <p className="text-sm text-slate-500 mt-1">ຈັດການຄ່າຕັ້ງລະບົບ.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-md shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-indigo-50 p-2 rounded-lg">
              <Globe className="text-indigo-500" size={20} />
            </div>
            <h2 className="text-lg font-semibold text-slate-800">ພາສາ</h2>
          </div>
          <p className="text-sm text-slate-500 mb-4">ປ່ຽນພາສາສະແດງຜົນຂອງລະບົບ.</p>
          <p className="text-sm text-slate-700 font-medium">ໃຊ້ປຸ່ມປ່ຽນພາສາຢູ່ດ້ານລຸ່ມຂວາຂອງໜ້າຈໍ.</p>
        </div>

        <div className="bg-white rounded-md shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-indigo-50 p-2 rounded-lg">
              <Bell className="text-indigo-500" size={20} />
            </div>
            <h2 className="text-lg font-semibold text-slate-800">ການແຈ້ງເຕືອນ</h2>
          </div>
          <p className="text-sm text-slate-500">ການຕັ້ງຄ່າການແຈ້ງເຕືອນຈະມີໃນການອັບເດດໜ້າ.</p>
        </div>

        <div className="bg-white rounded-md shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-indigo-50 p-2 rounded-lg">
              <Shield className="text-indigo-500" size={20} />
            </div>
            <h2 className="text-lg font-semibold text-slate-800">ຄວາມປອດໄພ</h2>
          </div>
          <p className="text-sm text-slate-500">ການປ່ຽນລະຫັດ ແລະ ການຢືນຢັນສອງຂັ້ນຕອນຈະມີໃນການອັບເດດໜ້າ.</p>
        </div>
      </div>
    </div>
  );
}
