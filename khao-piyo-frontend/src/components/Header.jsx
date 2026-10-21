import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, BadgePercent } from 'lucide-react';

// Hero banner. Drop a PNG with a transparent background at /public/hero.png.
const Header = () => {
  const [imgOk, setImgOk] = useState(true);

  return (
    <section className="container-x pt-4">
      <div className="relative overflow-hidden rounded-3xl bg-brand text-white">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-turmeric/30" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-white/10" />

        <div className="relative grid items-center gap-8 px-6 py-12 sm:px-10 md:grid-cols-2 lg:px-16 lg:py-16">
          <div className="animate-slide-in-left">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-medium">
              <BadgePercent className="h-4 w-4" /> Free delivery on orders above ₹299
            </p>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
              Order your favourite food at the best prices
            </h1>
            <p className="mt-4 max-w-md text-base text-white/90 sm:text-lg">
              Biryani, pizza, thali and more, hot from local kitchens to your door in about 30 minutes.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <Link to="/explore" className="btn bg-white !px-7 !py-3 text-base text-brand hover:bg-white/90">
                Explore menu
              </Link>
              <span className="inline-flex items-center gap-2 text-sm text-white/90">
                <Clock className="h-4 w-4" /> Avg. delivery 30 min
              </span>
            </div>
          </div>

          <div className="animate-slide-in-right relative mx-auto aspect-square w-full max-w-sm">
            <div className="absolute inset-4 rounded-full bg-white/15" />
            {imgOk ? (
              <img
                src="/hero.png"
                alt="A plate of freshly cooked food"
                onError={() => setImgOk(false)}
                className="relative h-full w-full object-contain drop-shadow-2xl"
              />
            ) : (
              <div className="relative grid h-full w-full place-items-center text-[9rem]" aria-hidden="true">🍛</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Header;
