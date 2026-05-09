import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import Onboarding from "@/components/pinoy/Onboarding";
import Builder from "@/components/pinoy/Builder";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pinoy Digital — Filipino-first link-in-bio" },
      {
        name: "description",
        content:
          "A Filipino-first link-in-bio app with native GCash & Maya QR support. Mobile-first, uniform across all devices.",
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

function Index() {
  const [lang, setLang] = useState<"en" | "tl">("en");
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [handle, setHandle] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("watawat");
  const [isPro, setIsPro] = useState(false);

  const handleRestart = () => {
    setStep(1);
    setFullName("");
    setEmail("");
    setMobile("");
    setHandle("");
  };

  return (
    <div className="min-h-screen w-full bg-[#050505] text-white antialiased">
      {/* Uniform mobile-first viewport — same single column on phone, tablet, and desktop */}
      <main className="mx-auto w-full max-w-[480px] min-h-screen flex flex-col bg-black">
        <div className="flex-1 w-full pt-4">
          {step < 4 ? (
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
              onFinish={() => setStep(4)}
            />
          ) : (
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
            />
          )}
        </div>
      </main>
    </div>
  );
}
