"use client";
import { useState, useEffect } from "react";
import { Button, Card, CardContent, Input } from "@ecom/ui";
import { Store, Phone, Mail, MapPin, Save, Lock } from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const [s, setS] = useState({ store_name: "", store_phone: "", store_whatsapp: "", store_email: "", store_address: "", store_timing: "" });
  const [saving, setSaving] = useState(false);
  const [pwd, setPwd] = useState({ current: "", newPwd: "", confirm: "" });
  const [pwdSaving, setPwdSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings").then(r => r.json()).then(d => {
      if (d.settings) { const m: any = {}; d.settings.forEach((x: any) => { m[x.key] = x.value; }); setS(p => ({...p, ...m})); }
    });
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ settings: s }) });
      if (!res.ok) throw new Error();
      toast.success("Saved!");
    } catch { toast.error("Failed"); }
    finally { setSaving(false); }
  };

  const changePassword = async () => {
    if (!pwd.current || !pwd.newPwd || !pwd.confirm) { toast.error("Sab fields bharो!"); return; }
    if (pwd.newPwd !== pwd.confirm) { toast.error("New password match nahi karta!"); return; }
    if (pwd.newPwd.length < 6) { toast.error("Password kam se kam 6 characters ka hona chahiye!"); return; }
    setPwdSaving(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: pwd.current, newPassword: pwd.newPwd }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success("Password change ho gaya!");
      setPwd({ current: "", newPwd: "", confirm: "" });
    } catch (e: any) { toast.error(e.message); }
    finally { setPwdSaving(false); }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Card><CardContent className="p-6 space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2"><Store className="h-5 w-5 text-green-600" />Store Settings</h2>
        <Input label="Store Name" icon={<Store className="h-4 w-4" />} value={s.store_name} onChange={(e) => setS({...s, store_name: e.target.value})} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Phone" icon={<Phone className="h-4 w-4" />} value={s.store_phone} onChange={(e) => setS({...s, store_phone: e.target.value})} />
          <Input label="WhatsApp" icon={<Phone className="h-4 w-4" />} value={s.store_whatsapp} onChange={(e) => setS({...s, store_whatsapp: e.target.value})} />
        </div>
        <Input label="Email" icon={<Mail className="h-4 w-4" />} value={s.store_email} onChange={(e) => setS({...s, store_email: e.target.value})} />
        <Input label="Address" icon={<MapPin className="h-4 w-4" />} value={s.store_address} onChange={(e) => setS({...s, store_address: e.target.value})} />
        <Input label="Timing" placeholder="8 AM - 10 PM" value={s.store_timing} onChange={(e) => setS({...s, store_timing: e.target.value})} />
        <Button onClick={save} loading={saving} className="w-full"><Save className="h-4 w-4 mr-2" />Save Settings</Button>
      </CardContent></Card>

      <Card><CardContent className="p-6 space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2"><Lock className="h-5 w-5 text-green-600" />Change Password</h2>
        <Input
          label="Current Password"
          type="password"
          icon={<Lock className="h-4 w-4" />}
          value={pwd.current}
          onChange={(e) => setPwd({...pwd, current: e.target.value})}
          placeholder="••••••••"
        />
        <Input
          label="New Password"
          type="password"
          icon={<Lock className="h-4 w-4" />}
          value={pwd.newPwd}
          onChange={(e) => setPwd({...pwd, newPwd: e.target.value})}
          placeholder="••••••••"
        />
        <Input
          label="Confirm New Password"
          type="password"
          icon={<Lock className="h-4 w-4" />}
          value={pwd.confirm}
          onChange={(e) => setPwd({...pwd, confirm: e.target.value})}
          placeholder="••••••••"
        />
        <Button onClick={changePassword} loading={pwdSaving} className="w-full" variant="outline">
          <Lock className="h-4 w-4 mr-2" />Change Password
        </Button>
      </CardContent></Card>
    </div>
  );
}