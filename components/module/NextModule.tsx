type Props = {
  number: string;
  title: string;
  blurb?: string | null;
  availableFrom?: Date | null;
};

export function NextModule({ number, title, blurb, availableFrom }: Props) {
  return (
    <section className="bg-navy text-cream">
      <div className="mx-auto max-w-[800px] px-6 py-16 text-center sm:px-8">
        <div className="label-mono mb-4">Coming Next</div>
        <h2 className="mb-3 font-serif text-4xl font-normal sm:text-5xl">
          Module {number} — {title}
        </h2>
        {blurb ? (
          <p className="mb-8 text-lg text-cream/70">{blurb}</p>
        ) : null}
        {availableFrom ? (
          <div className="inline-block border border-gold px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-gold">
            Available{" "}
            {availableFrom.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
}
