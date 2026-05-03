import { redirect } from "next/navigation";

import { defaultLocale } from "@/shared/core/i18n";

export default function Home() {
  redirect(`/${defaultLocale}`);
}
