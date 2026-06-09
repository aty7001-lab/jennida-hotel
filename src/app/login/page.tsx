import { getDictionary } from "@/lib/dictionary";
import LoginForm from "@/components/LoginForm";

export default async function LoginPage() {
  const dict = await getDictionary();
  return <LoginForm dict={dict.login} />;
}
