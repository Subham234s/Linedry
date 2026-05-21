import React from 'react';

const stats = [
  { value: '1,250+', label: 'Clothes Washed', suffix: '' },
  { value: '7,800+', label: 'Items Delivered', suffix: '' },
  { value: '5,000+', label: 'Laundry Bags', suffix: '' },
  { value: '4.9', label: 'Average Rating', suffix: '★' },
];

export default function StatsSection() {
  return (
    <section className="bg-white border-b border-border">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-border">
          {stats?.map((stat, i) => (
            <div key={`stat-${stat?.label}`} className="py-10 px-8 text-center">
              <p className="text-3xl md:text-4xl font-extrabold text-primary font-tabular">
                {stat?.value}
                <span className="text-secondary ml-1">{stat?.suffix}</span>
              </p>
              <p className="text-sm text-muted-foreground font-medium mt-2">{stat?.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
