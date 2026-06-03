import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import Onboarding from "@/components/pinoy/Onboarding";
import Builder from "@/components/pinoy/Builder";
import PublishedSuccess from "@/components/pinoy/PublishedSuccess";
import { publishProfile } from "@/lib/publishProfile";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pinoy Digital — Filipino-first link-in-bio" },
      {
        name: "description",
        content: "A Filipino-first link-in-bio app with native GCash & Maya QR support. Mobile-first, uniform across all devices.",
      },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  component: Index,
});

// ─── Flow ────────────────────────────────────────────────────────
// step 1 → Name / Email / Mobile
// step 2 → Claim handle
// step 3 → Pick template  ("Publish my link" creates profile → step 4)
// step 4 → Builder — design everything (links, theme, colors, bg image)
// step 5 → Published success screen (QR + share)
// step 6 → Back to Builder (continue editing)
// ─────────────────────────────────────────────────────────────────

function Index() {
  const [lang, setLang] = useState<"en" | "tl">("en");
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [handle, setHandle] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("watawat");
  const [isPro, setIsPro] = useState(false);
  const [published, setPublished] = useState<{ url: string; shortUrl: string; handle: string } | null>(null);

  const handleRestart = () => {
    setStep(1);
    setFullName("");
    setEmail("");
    setMobile("");
    setHandle("");
    setPublished(null);
  };

  // Step 3 → creates the profile row in Supabase, then drops user into Builder
  const handlePublish = async () => {
    const result = await publishProfile({ fullName, email, mobile, handle, selectedTemplate });
    setPublished({ url: result.url, shortUrl: result.shortUrl, handle: result.handle });
    setStep(4); // → Builder, NOT success screen
  };

  return (
    <div className="min-h-screen w-full bg-[#050505] text-white antialiased">
      <main className="mx-auto w-full max-w-[480px] min-h-screen flex flex-col bg-black">
        <div className="flex-1 w-full pt-4">

          {/* Steps 1–3: Onboarding */}
          {step <= 3 && (
            <Onboarding
              lang={lang}
              setLang={setLang}
              step={step}
              setStep={setStep}
              fullName={fullName}
              setFullName={setFullName}
              email={email}
              setEmail={setEmail}
              mobile={mobile}
              setMobile={setMobile}
              handle={handle}
              setHandle={setHandle}
              selectedTemplate={selectedTemplate}
              setSelectedTemplate={setSelectedTemplate}
              onFinish={handlePublish}
            />
          )}

          {/* Step 4: Builder — design your profile */}
          {step === 4 && (
            <Builder
              lang={lang}
              setLang={setLang}
              fullName={fullName}
              setFullName={setFullName}
              handle={handle}
              selectedTemplate={selectedTemplate}
              setSelectedTemplate={setSelectedTemplate}
              onSignOut={handleRestart}
              isPro={isPro}
              setIsPro={setIsPro}
              onPublished={() => setStep(5)}
            />
          )}

          {/* Step 5: Published success screen */}
          {step === 5 && published && (
            <PublishedSuccess
              fullName={fullName || "friend"}
              handle={published.handle}
              url={published.url}
              shortUrl={published.shortUrl}
              onContinue={() => setStep(4)}
            />
          )}

        </div>
      </main>
    </div>
  );
}
