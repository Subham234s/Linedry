import React from 'react';
import { MapPin, ArrowUpRight } from 'lucide-react';

const locations = [
  {
    id: 'loc-kolkata-central',
    name: 'Linedry Central',
    city: 'Kolkata',
    address: 'Park Street, Kolkata – 700 016',
  },
  {
    id: 'loc-mumbai-south',
    name: 'Linedry South',
    city: 'Mumbai',
    address: 'Koramangala – Linking Road, Mumbai',
  },
  {
    id: 'loc-delhi-north',
    name: 'Linedry North',
    city: 'Delhi',
    address: 'Connaught Place, New Delhi – 110 001',
  },
];

export default function LocationsSection() {
  return (
    <section className="py-16 bg-background">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
        <div className="bg-primary rounded-3xl p-8 md:p-10">
          <h2 className="text-2xl font-extrabold text-white mb-2">Linedry Locations</h2>
          <p className="text-white/50 text-sm mb-8">Find the nearest Linedry hub in your city.</p>

          <div className="flex flex-col gap-4">
            {locations?.map((loc) => (
              <div
                key={loc?.id}
                className="flex items-center justify-between bg-white/10 rounded-xl px-5 py-4 hover:bg-white/15 transition-colors duration-150"
              >
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-secondary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-white text-sm">{loc?.name}</p>
                    <p className="text-white/60 text-xs mt-0.5">{loc?.address}</p>
                  </div>
                </div>
                <button className="flex items-center gap-1.5 text-xs font-semibold text-white/70 hover:text-white border border-white/20 px-3 py-1.5 rounded-full hover:border-white/40 transition-all duration-150">
                  Get Directions <ArrowUpRight size={12} />
                </button>
              </div>
            ))}
          </div>

          <button className="mt-6 text-sm font-bold text-secondary hover:text-secondary/80 transition-colors">
            See All Locations →
          </button>
        </div>
      </div>
    </section>
  );
}
