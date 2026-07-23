import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import gm1 from "../assets/gmaps/beau-t-1.jpg.asset.json";
import gm2 from "../assets/gmaps/beau-t-2.jpg.asset.json";
import gm3 from "../assets/gmaps/beau-t-3.jpg.asset.json";
import gm4 from "../assets/gmaps/beau-t-4.jpg.asset.json";
import gm5 from "../assets/gmaps/beau-t-5.jpg.asset.json";
import gm6 from "../assets/gmaps/beau-t-6.jpg.asset.json";
import gm7 from "../assets/gmaps/beau-t-7.jpg.asset.json";
import gm8 from "../assets/gmaps/beau-t-8.jpg.asset.json";
import gm9 from "../assets/gmaps/beau-t-9.jpg.asset.json";
import gm10 from "../assets/gmaps/beau-t-10.jpg.asset.json";
import serviceHair from "../assets/service-hair.jpg";
import serviceMassage from "../assets/service-massage.jpg";
import serviceNails from "../assets/service-nails.jpg";
import serviceFacial from "../assets/service-facial.jpg";
const gmapsPhotos = [gm1, gm2, gm3, gm4, gm5, gm6, gm7, gm8, gm9, gm10].map((a) => a.url);
const salonPhotos = {
  hero: gm1.url,
  hair: serviceHair,
  massage: serviceMassage,
  nails: serviceNails,
  facial: serviceFacial,
  story: gm7.url,
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Beau-T Spa Lounge — Salon & Spa in Doha" },
      {
        name: "description",
        content:
          "Beau-T Spa Lounge in Al Gharrafa, Doha. Hair styling, Thai massage, facials, manicure & pedicure. Book your appointment — open until 9 PM.",
      },
      { property: "og:title", content: "Beau-T Spa Lounge — Doha" },
      {
        property: "og:description",
        content: "Luxury beauty salon & spa in Al Gharrafa, Doha. Book online — call XXXXXXXXX.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const services = [
  {
    name: "Hair Styling",
    tagline: "Cut, color, blow-dry & treatments",
    price: "from QAR 80",
    img: salonPhotos.hair,
    desc: "Precision cuts, glossy blow-outs, deep conditioning and colour services tailored to you.",
  },
  {
    name: "Thai Massage & Body",
    tagline: "Traditional Thai, aroma & hot stone",
    price: "from QAR 150",
    img: salonPhotos.massage,
    desc: "Authentic Thai therapy with signature aromatherapy oils — unwind, restore, breathe.",
  },
  {
    name: "Manicure & Pedicure",
    tagline: "Classic, gel & spa treatments",
    price: "from QAR 60",
    img: salonPhotos.nails,
    desc: "Meticulously groomed nails, softened skin and finishes that last.",
  },
  {
    name: "Facials & Skincare",
    tagline: "Radiance, hydration & anti-ageing",
    price: "from QAR 120",
    img: salonPhotos.facial,
    desc: "Bespoke facials designed to reveal a luminous, refreshed complexion.",
  },
];

const reviews = [
  {
    name: "Aljazi Almannai",
    body: "Perfect hair treatment with special thai massage. A truly beautiful experience.",
    stars: 5,
  },
  {
    name: "Abhakorn Romsabai",
    body: "New Salon in Gharafa. It's clean and relaxing. Lovely staff 🇶🇦",
    stars: 5,
  },
  {
    name: "Local Client",
    body: "The atmosphere is calming and the styling is beautiful — my new go-to salon in Doha.",
    stars: 4,
  },
];

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5 text-[color:var(--gold)]">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} aria-hidden>
          {i < n ? "★" : "☆"}
        </span>
      ))}
    </div>
  );
}

function Index() {
  const [booking, setBooking] = useState({
    name: "",
    phone: "",
    service: services[0].name,
    date: "",
    time: "",
    notes: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const waMessage = encodeURIComponent(
    `Hello Beau-T Spa Lounge, I'd like to book:\n• Name: ${booking.name}\n• Service: ${booking.service}\n• Date: ${booking.date}\n• Time: ${booking.time}\n• Notes: ${booking.notes}`,
  );

  return (
    <div className="min-h-screen bg-background font-[family-name:var(--font-sans)] text-foreground">
      {/* Nav */}
      <header className="fixed top-0 z-40 w-full border-b border-border/60 bg-background/90 backdrop-blur-md">
        <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <a href="#top" className="flex min-w-0 items-baseline gap-2">
            <span className="shrink-0 font-[family-name:var(--font-serif)] text-2xl italic">
              Beau-T
            </span>
            <span className="truncate text-[9px] uppercase tracking-[0.24em] text-muted-foreground min-[380px]:text-[10px] min-[380px]:tracking-[0.3em]">
              Spa · Lounge
            </span>
          </a>
          <nav className="hidden gap-8 text-sm md:flex">
            <a href="#services" className="hover:text-[color:var(--gold)]">Services</a>
            <a href="#about" className="hover:text-[color:var(--gold)]">About</a>
            <a href="#gallery" className="hover:text-[color:var(--gold)]">Gallery</a>
            <a href="#reviews" className="hover:text-[color:var(--gold)]">Reviews</a>
            <a href="#visit" className="hover:text-[color:var(--gold)]">Visit</a>
          </nav>
          <a
            href="#book"
            className="shrink-0 rounded-full bg-primary px-4 py-2 text-[10px] uppercase tracking-widest text-primary-foreground transition hover:opacity-90 sm:px-5 sm:text-xs"
          >
            Book Now
          </a>
        </div>
      </header>

      {/* Hero */}
      <section id="top" className="relative min-h-[92svh] w-full overflow-hidden sm:min-h-screen">
        <img
          src={salonPhotos.hero}
          alt="Beau-T Spa Lounge interior"
          width={1600}
          height={1100}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="salon-hero-scrim absolute inset-0" />
        <div className="relative mx-auto flex min-h-[92svh] max-w-7xl flex-col justify-center px-4 pt-24 text-foreground sm:min-h-screen sm:px-6">
          <span className="mb-5 text-[10px] uppercase tracking-[0.24em] text-[color:var(--gold)] sm:mb-6 sm:text-xs sm:tracking-[0.4em]">
            Al Gharrafa · Doha · Est. Since Opening
          </span>
          <h1 className="max-w-4xl font-[family-name:var(--font-serif)] text-[2.75rem] leading-[1.03] sm:text-6xl md:text-7xl lg:text-8xl">
            Where beauty <em className="text-[color:var(--gold)]">breathes</em> and time slows.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg">
            A sanctuary of hair, skin and Thai therapy in the heart of Al Gharrafa —
            crafted for those who value quiet luxury.
          </p>
          <div className="mt-8 grid w-full max-w-sm gap-3 sm:mt-10 sm:flex sm:max-w-none sm:flex-wrap sm:gap-4">
            <a
              href="#book"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-6 py-3 text-center text-xs uppercase tracking-widest text-primary-foreground transition hover:opacity-90 sm:px-8 sm:text-sm"
            >
              Reserve Your Visit
            </a>
            <a
              href="tel:+974XXXXXXXXX"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-primary/30 bg-background/65 px-6 py-3 text-center text-xs uppercase tracking-widest text-foreground backdrop-blur transition hover:bg-background sm:px-8 sm:text-sm"
            >
              Call XXXXXXXXX
            </a>
          </div>
          <div className="mt-12 grid max-w-md grid-cols-2 gap-x-6 gap-y-6 text-sm text-foreground sm:mt-16 sm:flex sm:max-w-none sm:flex-wrap sm:items-center sm:gap-8">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[color:var(--gold)] text-lg">★★★★☆</span>
                <span className="font-medium">4.1</span>
              </div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">19 Google Reviews</div>
            </div>
            <div>
              <div className="font-medium">Open Today</div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Closes 9:00 PM</div>
            </div>
            <div className="col-span-2 sm:col-auto">
              <div className="font-medium">Al Gharrafa</div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Bldg 44, Street 685</div>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="grid gap-12 md:grid-cols-2 md:items-center lg:gap-16">
          <div>
            <span className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--gold)] sm:text-xs sm:tracking-[0.4em]">
              Our Story
            </span>
            <h2 className="mt-4 font-[family-name:var(--font-serif)] text-3xl leading-tight sm:text-4xl md:text-5xl">
              A quiet corner of Doha, devoted to the art of feeling beautiful.
            </h2>
            <p className="mt-6 leading-relaxed text-muted-foreground">
              Beau-T Spa Lounge is a boutique beauty destination in Al Gharrafa, blending
              refined hair artistry with the calming rituals of Thai wellness. Our team
              treats every guest as an honoured visitor — with warmth, discretion and the
              kind of care that lingers long after you leave.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Clean rooms, natural products, and a menu that spans everything from a
              flawless blow-dry to a full-body Thai massage.
            </p>
            <div className="mt-8 grid grid-cols-1 gap-5 border-t border-border pt-8 min-[380px]:grid-cols-3 sm:gap-6">
              <div>
                <div className="font-[family-name:var(--font-serif)] text-3xl">4.1★</div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Rated</div>
              </div>
              <div>
                <div className="font-[family-name:var(--font-serif)] text-3xl">12+</div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Services</div>
              </div>
              <div>
                <div className="font-[family-name:var(--font-serif)] text-3xl">9 PM</div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Open Late</div>
              </div>
            </div>
          </div>
          <div className="relative">
            <img
              src={salonPhotos.story}
              alt="Serene treatment room"
              width={1000}
              height={1200}
              loading="lazy"
              className="aspect-[4/5] w-full rounded-sm object-cover shadow-[var(--shadow-soft)]"
            />
            <div className="absolute -bottom-6 -left-6 hidden bg-accent px-6 py-4 text-accent-foreground md:block">
              <div className="font-[family-name:var(--font-serif)] text-2xl italic">Beau-T</div>
              <div className="text-[10px] uppercase tracking-[0.3em]">A sanctuary in Al Gharrafa</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="bg-secondary py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-12 grid gap-6 sm:mb-16 md:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] md:items-end">
            <div className="min-w-0">
              <span className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--gold)] sm:text-xs sm:tracking-[0.4em]">
                The Menu
              </span>
              <h2 className="mt-3 font-[family-name:var(--font-serif)] text-3xl leading-tight sm:text-4xl md:text-5xl">
                Services & Treatments
              </h2>
            </div>
            <p className="max-w-md text-muted-foreground">
              Every treatment is customised on arrival. Prices are starting rates —
              your therapist will walk you through options during consultation.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {services.map((s) => (
              <article
                key={s.name}
                className="group flex flex-col overflow-hidden border border-border bg-card shadow-sm transition hover:shadow-[var(--shadow-soft)]"
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src={s.img}
                    alt={s.name}
                    width={1000}
                    height={1200}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-[family-name:var(--font-serif)] text-2xl">{s.name}</h3>
                  <p className="mt-1 text-xs uppercase tracking-widest text-[color:var(--gold)]">
                    {s.tagline}
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                  <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                    <span className="text-sm font-medium">{s.price}</span>
                    <a
                      href="#book"
                      className="text-xs uppercase tracking-widest text-primary hover:text-[color:var(--gold)]"
                    >
                      Book →
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Extended price list */}
          <div className="mt-12 grid gap-x-16 gap-y-4 rounded-sm border border-border bg-card p-4 sm:mt-16 sm:p-6 md:grid-cols-2 md:p-10">
            {[
              ["Signature Blow-Dry", "QAR 90"],
              ["Hair Colour (Full)", "QAR 350"],
              ["Keratin Treatment", "QAR 600"],
              ["Bridal Styling", "QAR 500"],
              ["Thai Massage (60 min)", "QAR 200"],
              ["Aroma Oil Massage", "QAR 250"],
              ["Gold Facial", "QAR 220"],
              ["Hydrafacial", "QAR 300"],
              ["Classic Manicure", "QAR 60"],
              ["Gel Pedicure", "QAR 120"],
              ["Full Body Wax", "QAR 280"],
              ["Threading & Brows", "QAR 40"],
            ].map(([name, price]) => (
              <div key={name} className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-4 border-b border-dashed border-border/60 py-2">
                <span className="min-w-0 text-sm">{name}</span>
                <span className="font-[family-name:var(--font-serif)] text-lg">{price}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section id="gallery" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="mb-12 text-center">
          <span className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--gold)] sm:text-xs sm:tracking-[0.4em]">
            Inside The Lounge
          </span>
          <h2 className="mt-3 font-[family-name:var(--font-serif)] text-3xl leading-tight sm:text-4xl md:text-5xl">
            A glimpse of the atmosphere
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {gmapsPhotos.map((src, i) => (
            <div
              key={i}
              className={`overflow-hidden ${i % 5 === 0 ? "row-span-2 aspect-[3/4]" : "aspect-square"}`}
            >
              <img
                src={src}
                alt={`Beau-T Spa Lounge — photo ${i + 1}`}
                loading="lazy"
                className="h-full w-full object-cover transition duration-700 hover:scale-105"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="bg-secondary py-20 text-foreground sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-14 text-center">
            <span className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--gold)] sm:text-xs sm:tracking-[0.4em]">
              Guest Voices
            </span>
            <h2 className="mt-3 font-[family-name:var(--font-serif)] text-3xl leading-tight sm:text-4xl md:text-5xl">
              4.1 ★ on Google · 19 Reviews
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {reviews.map((r) => (
              <figure key={r.name} className="border border-border bg-card p-6 sm:p-8">
                <Stars n={r.stars} />
                <blockquote className="mt-5 font-[family-name:var(--font-serif)] text-xl leading-snug italic">
                  “{r.body}”
                </blockquote>
                <figcaption className="mt-6 text-xs uppercase tracking-widest text-muted-foreground">
                  — {r.name}
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="mt-12 text-center">
            <a
              href="https://www.google.com/maps/place/Beau-T+Spa+Lounge/@25.323236,51.4542088,17z"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block border-b border-primary pb-1 text-sm uppercase tracking-widest text-primary"
            >
              Read all reviews on Google →
            </a>
          </div>
        </div>
      </section>

      {/* Booking */}
      <section id="book" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="grid gap-12 md:grid-cols-2 lg:gap-16">
          <div>
            <span className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--gold)] sm:text-xs sm:tracking-[0.4em]">
              Reservations
            </span>
            <h2 className="mt-3 font-[family-name:var(--font-serif)] text-3xl leading-tight sm:text-4xl md:text-5xl">
              Book your moment.
            </h2>
            <p className="mt-6 leading-relaxed text-muted-foreground">
              Reserve online, or reach us directly on WhatsApp. Same-day appointments
              are usually available — we'll confirm within the hour.
            </p>
            <div className="mt-10 space-y-5">
              <a
                href="tel:+974XXXXXXXXX"
                className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 border-b border-border pb-4"
              >
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Phone</span>
                <span className="min-w-0 text-right font-[family-name:var(--font-serif)] text-xl sm:text-2xl">+974 XXXXXXXXX</span>
              </a>
              <a
                href={`https://wa.me/974XXXXXXXXX?text=${waMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 border-b border-border pb-4"
              >
                <span className="text-xs uppercase tracking-widest text-muted-foreground">WhatsApp</span>
                <span className="min-w-0 text-right font-[family-name:var(--font-serif)] text-xl sm:text-2xl">Message us</span>
              </a>
              <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 border-b border-border pb-4">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Hours</span>
                <span className="min-w-0 text-right">
                  Sat–Thu · 10:00 – 21:00
                  <br />
                  <span className="text-sm text-muted-foreground">Friday · 2:00 PM – 21:00</span>
                </span>
              </div>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
              window.open(`https://wa.me/974XXXXXXXXX?text=${waMessage}`, "_blank");
            }}
            className="border border-border bg-card p-5 sm:p-8 md:p-10"
          >
            <h3 className="font-[family-name:var(--font-serif)] text-2xl">Request an Appointment</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Fill in the details and we'll confirm by WhatsApp.
            </p>

            <div className="mt-8 space-y-5">
              <Field label="Your Name">
                <input
                  required
                  value={booking.name}
                  onChange={(e) => setBooking({ ...booking, name: e.target.value })}
                  className="w-full border-0 border-b border-border bg-transparent py-2 focus:border-[color:var(--gold)] focus:outline-none"
                />
              </Field>
              <Field label="Phone">
                <input
                  required
                  type="tel"
                  value={booking.phone}
                  onChange={(e) => setBooking({ ...booking, phone: e.target.value })}
                  className="w-full border-0 border-b border-border bg-transparent py-2 focus:border-[color:var(--gold)] focus:outline-none"
                />
              </Field>
              <Field label="Service">
                <select
                  value={booking.service}
                  onChange={(e) => setBooking({ ...booking, service: e.target.value })}
                  className="w-full border-0 border-b border-border bg-transparent py-2 focus:border-[color:var(--gold)] focus:outline-none"
                >
                  {services.map((s) => (
                    <option key={s.name}>{s.name}</option>
                  ))}
                  <option>Bridal Package</option>
                  <option>Consultation</option>
                </select>
              </Field>
              <div className="grid gap-5 min-[430px]:grid-cols-2">
                <Field label="Date">
                  <input
                    required
                    type="date"
                    value={booking.date}
                    onChange={(e) => setBooking({ ...booking, date: e.target.value })}
                    className="w-full border-0 border-b border-border bg-transparent py-2 focus:border-[color:var(--gold)] focus:outline-none"
                  />
                </Field>
                <Field label="Time">
                  <input
                    required
                    type="time"
                    value={booking.time}
                    onChange={(e) => setBooking({ ...booking, time: e.target.value })}
                    className="w-full border-0 border-b border-border bg-transparent py-2 focus:border-[color:var(--gold)] focus:outline-none"
                  />
                </Field>
              </div>
              <Field label="Notes (optional)">
                <textarea
                  rows={3}
                  value={booking.notes}
                  onChange={(e) => setBooking({ ...booking, notes: e.target.value })}
                  className="w-full resize-none border-0 border-b border-border bg-transparent py-2 focus:border-[color:var(--gold)] focus:outline-none"
                />
              </Field>
            </div>

            <button
              type="submit"
              className="mt-8 w-full rounded-full bg-primary px-4 py-4 text-xs uppercase tracking-[0.18em] text-primary-foreground transition hover:opacity-90 sm:tracking-[0.3em]"
            >
              Send Request via WhatsApp
            </button>
            {submitted && (
              <p className="mt-4 text-center text-sm text-[color:var(--gold)]">
                Opening WhatsApp… we'll confirm your booking shortly.
              </p>
            )}
          </form>
        </div>
      </section>

      {/* Visit */}
      <section id="visit" className="bg-secondary py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-12 grid gap-8 md:grid-cols-3">
            <div>
              <span className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--gold)] sm:text-xs sm:tracking-[0.4em]">
                Visit
              </span>
              <h2 className="mt-3 font-[family-name:var(--font-serif)] text-3xl leading-tight sm:text-4xl">
                Find us in Al Gharrafa
              </h2>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest text-muted-foreground">Address</h4>
              <p className="mt-2 leading-relaxed">
                Beau-T Spa Lounge<br />
                Bldg 44, Street 685<br />
                Al Gharrafa, Doha, Qatar<br />
                <span className="text-muted-foreground">Plus Code: 8FF4+7P Doha</span>
              </p>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest text-muted-foreground">Contact</h4>
              <p className="mt-2 leading-relaxed">
                <a href="tel:+974XXXXXXXXX" className="hover:text-[color:var(--gold)]">+974 XXXXXXXXX</a><br />
                <a
                  href="https://www.google.com/maps/place/Beau-T+Spa+Lounge/@25.323236,51.4542088,17z"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[color:var(--gold)]"
                >
                  Get Directions →
                </a>
              </p>
            </div>
          </div>
          <div className="aspect-[4/3] w-full overflow-hidden border border-border sm:aspect-[16/7]">
            <iframe
              title="Beau-T Spa Lounge location"
              src="https://www.google.com/maps?q=Beau-T+Spa+Lounge+Doha&z=16&output=embed"
              className="h-full w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-14">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 md:grid-cols-4">
          <div>
            <div className="font-[family-name:var(--font-serif)] text-3xl italic">Beau-T</div>
            <p className="mt-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Spa · Lounge · Doha
            </p>
            <p className="mt-6 text-sm text-muted-foreground">
              A boutique sanctuary of hair, skin and Thai wellness in Al Gharrafa.
            </p>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-widest text-muted-foreground">Explore</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><a href="#services" className="hover:text-[color:var(--gold)]">Services</a></li>
              <li><a href="#gallery" className="hover:text-[color:var(--gold)]">Gallery</a></li>
              <li><a href="#reviews" className="hover:text-[color:var(--gold)]">Reviews</a></li>
              <li><a href="#book" className="hover:text-[color:var(--gold)]">Book</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-widest text-muted-foreground">Hours</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li>Sat – Thu · 10:00 – 21:00</li>
              <li>Friday · 14:00 – 21:00</li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-widest text-muted-foreground">Contact</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><a href="tel:+974XXXXXXXXX" className="hover:text-[color:var(--gold)]">+974 XXXXXXXXX</a></li>
              <li>Bldg 44, Street 685, Al Gharrafa</li>
              <li>Doha, Qatar</li>
            </ul>
          </div>
        </div>
        <div className="mx-auto mt-12 flex max-w-7xl flex-wrap items-center justify-between gap-4 border-t border-border px-4 pt-6 text-xs text-muted-foreground sm:px-6">
          <span>© {new Date().getFullYear()} Beau-T Spa Lounge. All rights reserved.</span>
          <span className="uppercase tracking-widest">Made with care in Doha</span>
        </div>
      </footer>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:tracking-[0.3em]">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
