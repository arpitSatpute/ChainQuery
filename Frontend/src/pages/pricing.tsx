import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

export default function DocsPage() {

  function handleAirdrop() {
    alert("Airdrop button clicked!");
  }

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <InteractiveHoverButton text="Airdrop" onClick={handleAirdrop}/>
      </section>
    </DefaultLayout>
  );
}
