begin;

-- Local/bootstrap content mirrored from content/static/site.json.
-- R2 objects are not uploaded by this seed; storage keys describe their intended location.
insert into public.site_settings (key, value, description)
values
  (
    'studio',
    '{"name":"ARCHITAK","tagline":"CREATED TO CREATE","statement":"Welcome to Architak, where creativity meets functionality to transform spaces into stunning works of art. As a premier interior designing company in Kochi, we craft environments that reflect your vision, style, and personality.","location":"Vyttila, Kochi, Kerala","address":"ARCK Tower, Neelamuri Line, Ponnurunni, Vyttila, Kochi 682019","phone":"+91 88919 91999","email":"architak336@gmail.com"}'::jsonb,
    'Studio identity and public contact content.'
  ),
  (
    'studio.process',
    '[{"step":"01","title":"Concept","description":"Transforming ideas into creative visions that reflect your style and purpose."},{"step":"02","title":"Design","description":"Crafting detailed plans that blend aesthetics with functionality for stunning spaces."},{"step":"03","title":"Development","description":"Bringing concepts to life with precision, quality craftsmanship, and timely execution."}]'::jsonb,
    'Studio process content.'
  )
on conflict (key) do update
set value = excluded.value,
    description = excluded.description;

insert into public.project_categories
  (slug, name, description, status, sort_order, published_at)
values
  ('hospitality', 'Hospitality', 'Immersive spaces for hotels, resorts, and leisure destinations — comfort balanced with elegance.', 'published', 10, '2026-08-21T00:00:00Z'),
  ('residential', 'Residential', 'Homes shaped as personal havens with aesthetic appeal and functional layouts.', 'published', 20, '2026-08-21T00:00:00Z'),
  ('corporate', 'Corporate', 'Workspaces that foster collaboration and professionalism while reflecting brand identity.', 'published', 30, '2026-08-21T00:00:00Z'),
  ('restaurant', 'Restaurant', 'Dining environments that express culinary identity, ambiance, and style.', 'published', 40, '2026-08-21T00:00:00Z'),
  ('commercial', 'Commercial', 'Retail and business environments that balance form, function, and engagement.', 'published', 50, '2026-08-21T00:00:00Z'),
  ('industrial', 'Industrial', 'Efficient, streamlined spaces that integrate robust functionality with thoughtful design.', 'published', 60, '2026-08-21T00:00:00Z')
on conflict (slug) do update
set name = excluded.name,
    description = excluded.description,
    status = excluded.status,
    sort_order = excluded.sort_order,
    published_at = excluded.published_at;

insert into public.media_assets
  (storage_key, visibility, mime_type, byte_size, alt_text, metadata)
values
  ('public/legacy/architak-in/2025__03__interior-of-modern-design-living-room-3d-rendering-e1604308696322.jpg', 'public', 'image/jpeg', 0, 'Living Room Atelier', '{"seedSource":"/media/architak-in/2025__03__interior-of-modern-design-living-room-3d-rendering-e1604308696322.jpg"}'),
  ('public/legacy/architak-in/2025__03__black-minimalist-interior-of-modern-living-room-3d-rendering-e1604308623589.jpg', 'public', 'image/jpeg', 0, 'Living Room Atelier gallery image 1', '{"seedSource":"/media/architak-in/2025__03__black-minimalist-interior-of-modern-living-room-3d-rendering-e1604308623589.jpg"}'),
  ('public/legacy/architak-in/2025__03__minimalist-living-room-e1604308401943.jpg', 'public', 'image/jpeg', 0, 'Living Room Atelier gallery image 2', '{"seedSource":"/media/architak-in/2025__03__minimalist-living-room-e1604308401943.jpg"}'),
  ('public/legacy/architak-in/2025__03__modern-living-room-with-black-leather-sofa-in-front-of-a-wooden-panel-e1604308631691.jpg', 'public', 'image/jpeg', 0, 'Living Room Atelier gallery image 3', '{"seedSource":"/media/architak-in/2025__03__modern-living-room-with-black-leather-sofa-in-front-of-a-wooden-panel-e1604308631691.jpg"}'),
  ('public/legacy/architak-in/2025__03__hotel-lobby-e1604307557586.jpg', 'public', 'image/jpeg', 0, 'Hospitality Lounge', '{"seedSource":"/media/architak-in/2025__03__hotel-lobby-e1604307557586.jpg"}'),
  ('public/legacy/architak-in/2025__03__3d-rendering-loft-and-luxury-hotel-reception-and-cafe-lounge-restaurant-e1604307414821.jpg', 'public', 'image/jpeg', 0, 'Hospitality Lounge gallery image 1', '{"seedSource":"/media/architak-in/2025__03__3d-rendering-loft-and-luxury-hotel-reception-and-cafe-lounge-restaurant-e1604307414821.jpg"}'),
  ('public/legacy/architak-in/2025__03__3d-rendering-loft-and-luxury-hotel-reception-and-vintage-cafe-lounge-restaurant-e1604307374857.jpg', 'public', 'image/jpeg', 0, 'Hospitality Lounge gallery image 2', '{"seedSource":"/media/architak-in/2025__03__3d-rendering-loft-and-luxury-hotel-reception-and-vintage-cafe-lounge-restaurant-e1604307374857.jpg"}'),
  ('public/legacy/architak-in/2025__03__travertine-house-kitchen.jpg', 'public', 'image/jpeg', 0, 'Kitchen Craft', '{"seedSource":"/media/architak-in/2025__03__travertine-house-kitchen.jpg"}'),
  ('public/legacy/architak-in/2025__03__travertine-house-kitchen-1024x1536.jpg', 'public', 'image/jpeg', 0, 'Kitchen Craft gallery image 1', '{"seedSource":"/media/architak-in/2025__03__travertine-house-kitchen-1024x1536.jpg"}'),
  ('public/legacy/architak-in/2025__03__architectural-house-interior-1.jpg', 'public', 'image/jpeg', 0, 'Kitchen Craft gallery image 2', '{"seedSource":"/media/architak-in/2025__03__architectural-house-interior-1.jpg"}'),
  ('public/legacy/architak-in/2025__03__3d-rendering-business-meeting-room-on-high-rise-office-building-e1604307631677.jpg', 'public', 'image/jpeg', 0, 'Corporate Chamber', '{"seedSource":"/media/architak-in/2025__03__3d-rendering-business-meeting-room-on-high-rise-office-building-e1604307631677.jpg"}'),
  ('public/legacy/architak-in/2025__03__3d-rendering-business-meeting-room-on-office-building-e1604307292878.jpg', 'public', 'image/jpeg', 0, 'Corporate Chamber gallery image 1', '{"seedSource":"/media/architak-in/2025__03__3d-rendering-business-meeting-room-on-office-building-e1604307292878.jpg"}'),
  ('public/legacy/architak-in/2025__03__interior-design-of-a-coffee-shop-cafe-3d-rendering-e1604308316522.jpg', 'public', 'image/jpeg', 0, 'Cafe Interior', '{"seedSource":"/media/architak-in/2025__03__interior-design-of-a-coffee-shop-cafe-3d-rendering-e1604308316522.jpg"}'),
  ('public/legacy/architak-in/2025__03__black-wooden-furniture-and-an-industrial-lamp-above-a-coffee-mac-e1604308501463.jpg', 'public', 'image/jpeg', 0, 'Cafe Interior gallery image 1', '{"seedSource":"/media/architak-in/2025__03__black-wooden-furniture-and-an-industrial-lamp-above-a-coffee-mac-e1604308501463.jpg"}'),
  ('public/legacy/architak-in/2025__03__modern-staircase-e1604307542327.jpg', 'public', 'image/jpeg', 0, 'Stair Sequence', '{"seedSource":"/media/architak-in/2025__03__modern-staircase-e1604307542327.jpg"}'),
  ('public/legacy/architak-in/2025__03__3d-rendering-interior-and-exterior-design-e1604307589570.jpg', 'public', 'image/jpeg', 0, 'Stair Sequence gallery image 1', '{"seedSource":"/media/architak-in/2025__03__3d-rendering-interior-and-exterior-design-e1604307589570.jpg"}')
on conflict (storage_key) do update
set visibility = excluded.visibility,
    mime_type = excluded.mime_type,
    alt_text = excluded.alt_text,
    metadata = excluded.metadata;

insert into public.projects
  (category_id, cover_media_id, slug, title, summary, location, status, is_featured, sort_order, published_at)
values
  ((select id from public.project_categories where slug = 'residential'), (select id from public.media_assets where storage_key = 'public/legacy/architak-in/2025__03__interior-of-modern-design-living-room-3d-rendering-e1604308696322.jpg'), 'living-room-atelier', 'Living Room Atelier', 'A calm, layered living interior with precise material contrast and spatial depth.', 'Kochi', 'published', true, 10, '2026-08-21T00:00:00Z'),
  ((select id from public.project_categories where slug = 'hospitality'), (select id from public.media_assets where storage_key = 'public/legacy/architak-in/2025__03__hotel-lobby-e1604307557586.jpg'), 'hospitality-lounge', 'Hospitality Lounge', 'Reception and lounge atmospheres designed for arrival, pause, and lasting impression.', 'Kochi', 'published', true, 20, '2026-08-21T00:00:00Z'),
  ((select id from public.project_categories where slug = 'residential'), (select id from public.media_assets where storage_key = 'public/legacy/architak-in/2025__03__travertine-house-kitchen.jpg'), 'kitchen-craft', 'Kitchen Craft', 'A kitchen composition focused on material honesty, light, and daily ritual.', 'Kochi', 'published', true, 30, '2026-08-21T00:00:00Z'),
  ((select id from public.project_categories where slug = 'corporate'), (select id from public.media_assets where storage_key = 'public/legacy/architak-in/2025__03__3d-rendering-business-meeting-room-on-high-rise-office-building-e1604307631677.jpg'), 'corporate-chamber', 'Corporate Chamber', 'Meeting and office environments tuned for clarity, focus, and brand presence.', 'Kochi', 'published', true, 40, '2026-08-21T00:00:00Z'),
  ((select id from public.project_categories where slug = 'restaurant'), (select id from public.media_assets where storage_key = 'public/legacy/architak-in/2025__03__interior-design-of-a-coffee-shop-cafe-3d-rendering-e1604308316522.jpg'), 'cafe-interior', 'Cafe Interior', 'Warm commercial hospitality with tactile finishes and intimate seating rhythm.', 'Kochi', 'published', true, 50, '2026-08-21T00:00:00Z'),
  ((select id from public.project_categories where slug = 'residential'), (select id from public.media_assets where storage_key = 'public/legacy/architak-in/2025__03__modern-staircase-e1604307542327.jpg'), 'stair-sequence', 'Stair Sequence', 'Circulation as architecture — a vertical sequence with measured light and form.', 'Kochi', 'published', true, 60, '2026-08-21T00:00:00Z')
on conflict (slug) do update
set category_id = excluded.category_id,
    cover_media_id = excluded.cover_media_id,
    title = excluded.title,
    summary = excluded.summary,
    location = excluded.location,
    status = excluded.status,
    is_featured = excluded.is_featured,
    sort_order = excluded.sort_order,
    published_at = excluded.published_at;

with gallery(project_slug, storage_key, sort_order) as (
  values
    ('living-room-atelier', 'public/legacy/architak-in/2025__03__black-minimalist-interior-of-modern-living-room-3d-rendering-e1604308623589.jpg', 10),
    ('living-room-atelier', 'public/legacy/architak-in/2025__03__minimalist-living-room-e1604308401943.jpg', 20),
    ('living-room-atelier', 'public/legacy/architak-in/2025__03__modern-living-room-with-black-leather-sofa-in-front-of-a-wooden-panel-e1604308631691.jpg', 30),
    ('hospitality-lounge', 'public/legacy/architak-in/2025__03__3d-rendering-loft-and-luxury-hotel-reception-and-cafe-lounge-restaurant-e1604307414821.jpg', 10),
    ('hospitality-lounge', 'public/legacy/architak-in/2025__03__3d-rendering-loft-and-luxury-hotel-reception-and-vintage-cafe-lounge-restaurant-e1604307374857.jpg', 20),
    ('kitchen-craft', 'public/legacy/architak-in/2025__03__travertine-house-kitchen-1024x1536.jpg', 10),
    ('kitchen-craft', 'public/legacy/architak-in/2025__03__architectural-house-interior-1.jpg', 20),
    ('corporate-chamber', 'public/legacy/architak-in/2025__03__3d-rendering-business-meeting-room-on-office-building-e1604307292878.jpg', 10),
    ('cafe-interior', 'public/legacy/architak-in/2025__03__black-wooden-furniture-and-an-industrial-lamp-above-a-coffee-mac-e1604308501463.jpg', 10),
    ('stair-sequence', 'public/legacy/architak-in/2025__03__3d-rendering-interior-and-exterior-design-e1604307589570.jpg', 10)
)
insert into public.project_media (project_id, media_asset_id, role, sort_order)
select project.id, asset.id, 'gallery', gallery.sort_order
from gallery
join public.projects project on project.slug = gallery.project_slug
join public.media_assets asset on asset.storage_key = gallery.storage_key
on conflict (project_id, media_asset_id) do update
set role = excluded.role,
    sort_order = excluded.sort_order;

commit;
