import React from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';


const posts = [
{
  id: 'post-delicate',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_16cdabf30-1778054326080.png",
  alt: 'Delicate silk and wool fabrics laid out on a white surface for care',
  category: 'LAUNDRY TIPS',
  date: 'March 5, 2026',
  author: 'OMI SPACE',
  title: 'Best Settings for Washing Delicate Fabrics'
},
{
  id: 'post-confidence',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_117063bc9-1772200771519.png",
  alt: 'Well-dressed professional in clean pressed clothing standing confidently',
  category: 'LIFESTYLE',
  date: 'March 5, 2026',
  author: 'OMI SPACE',
  title: 'How Clean Clothes Affect Your Confidence'
},
{
  id: 'post-white',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1a4b17265-1772221333938.png",
  alt: 'Bright white clothes tumbling in a washing machine drum',
  category: 'LAUNDRY TIPS',
  date: 'March 5, 2026',
  author: 'OMI SPACE',
  title: 'How to Wash White Clothes Without Damage'
}];


export default function BlogSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left: heading */}
          <div className="lg:sticky lg:top-24">
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-secondary mb-3 block">Laundry Tips</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-primary leading-tight mb-4">
              Insights to Keep
              <br />
              Clothes Fresh Daily
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-sm">
              Read expert tips, tricks, and ideas to simplify your laundry routine and get the best results every time.
            </p>
            <Link
              href="#"
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full text-sm font-bold hover:opacity-90 active:scale-95 transition-all duration-150">
              
              View All Tips
            </Link>
          </div>

          {/* Right: post list */}
          <div className="flex flex-col gap-5">
            {posts?.map((post) =>
            <div
              key={post?.id}
              className="flex gap-5 items-start group cursor-pointer">
              
                <div className="relative w-28 h-24 rounded-xl overflow-hidden flex-shrink-0">
                  <AppImage
                  src={post?.image}
                  alt={post?.alt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300" />
                
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground font-semibold mb-1">
                    BY {post?.author} / {post?.date}
                  </p>
                  <h3 className="font-bold text-sm text-primary leading-snug group-hover:text-primary/70 transition-colors">
                    {post?.title}
                  </h3>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>);

}
