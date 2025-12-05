import React from 'react';

export function GoogleMapEmbed({ center, zoom = 6 }) {
  const query = center && center.trim().length > 0 ? center : 'World';
  const src = `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=${zoom}&output=embed`;

  return (
    <div className="w-full h-64 rounded-xl overflow-hidden border border-border bg-muted">
      <iframe
        title="Google Maps"
        src={src}
        width="100%"
        height="100%"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="w-full h-full border-0"
        allowFullScreen
      />
    </div>
  );
}
