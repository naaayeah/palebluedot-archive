-- Seed planet data
insert into planets (id, name, subtitle, description, distance, question_prompt, video_url, is_visible) values
(
  'mercury',
  'Mercury',
  'The Swift Messenger',
  'Mercury is the smallest planet in our solar system and the closest to the Sun. Its surface is covered in craters, much like our Moon, bearing the scars of billions of years of cosmic bombardment. Despite its proximity to the Sun, it is not the hottest planet — Venus claims that title. Mercury has virtually no atmosphere to retain heat, so temperatures swing wildly from 430°C in sunlight to -180°C in darkness.',
  '77 million km from Earth (avg)',
  'If you could send one message to a world with no atmosphere, no water, no sky — what would you say to the silence?',
  null,
  true
),
(
  'venus',
  'Venus',
  'The Veiled World',
  'Venus is Earth''s twisted twin — nearly identical in size, yet utterly alien. Its thick atmosphere of carbon dioxide traps heat in a runaway greenhouse effect, making it the hottest planet in our solar system at 465°C. Clouds of sulfuric acid shroud its surface from view. Beneath that veil lies a landscape of volcanic plains, highland plateaus, and mountains — a world that might have once harbored oceans.',
  '261 million km from Earth (avg)',
  'Venus may have been habitable billions of years ago. What do you hope we never lose about our own world?',
  null,
  true
),
(
  'earth',
  'Earth',
  'The Pale Blue Dot',
  'Seen from 6 billion kilometers away, Earth is a pale blue dot — a mote of dust suspended in a sunbeam. It is the only world we know of that harbors life. Its oceans cover 71% of its surface, its atmosphere is rich with oxygen, and its magnetic field shields it from solar winds. For now, it is the only home we have. As Carl Sagan wrote: on this mote of dust, suspended in a sunbeam, everyone you love, everyone you know, everyone you ever heard of, lived out their lives.',
  '0 km (you are here)',
  'Looking up at the cosmos, what do you feel about being alive on this pale blue dot?',
  null,
  true
),
(
  'mars',
  'Mars',
  'The Red Planet',
  'Mars has captivated humanity for millennia. Its rust-red surface, carved by ancient rivers and shaped by the largest volcano in the solar system, tells a story of a world that was once warmer and wetter. Today it is cold, dry, and thin-atmosphered — yet it remains our most likely stepping stone to the stars. Robotic explorers have roamed its surface for decades, and the first human footprints may not be far off.',
  '225 million km from Earth (avg)',
  'If you were the first human to stand on Mars and look back at the pale blue dot of Earth, what would you think?',
  null,
  true
),
(
  'jupiter',
  'Jupiter',
  'The Great Protector',
  'Jupiter is the king of planets — a colossal ball of gas more than twice as massive as all other planets combined. Its Great Red Spot, a storm larger than Earth, has raged for centuries. Jupiter''s immense gravity acts as a cosmic shield, deflecting or capturing comets and asteroids that might otherwise strike Earth. It has at least 95 known moons, including Europa — an icy world with a subsurface ocean that may harbor life.',
  '628 million km from Earth (avg)',
  'Jupiter silently guards the inner solar system. Who or what protects you, often without your knowing?',
  null,
  true
),
(
  'saturn',
  'Saturn',
  'Lord of the Rings',
  'Saturn is perhaps the most visually stunning planet in our solar system. Its magnificent ring system, made of countless ice and rock particles, spans up to 282,000 km but is remarkably thin — often less than 100 meters. Saturn is the least dense planet; it would float on water. Its moon Titan has a thick atmosphere and lakes of liquid methane, making it one of the most Earth-like worlds despite being profoundly alien.',
  '1.2 billion km from Earth (avg)',
  'Saturn wears its beauty like armor. What beauty do you carry that most people never see?',
  null,
  true
),
(
  'uranus',
  'Uranus',
  'The Tilted Giant',
  'Uranus is the most unusual planet in our solar system — it rotates on its side, with its poles facing the Sun in what was likely caused by a massive collision long ago. Its atmosphere contains hydrogen, helium, and methane, which absorbs red light and gives it its characteristic blue-green hue. Despite being called an "ice giant," its interior is scorching hot. Uranus has 27 known moons, all named after characters from Shakespeare and Alexander Pope.',
  '2.7 billion km from Earth (avg)',
  'Uranus moves through space tilted, different from all others. What makes you different from everyone around you?',
  null,
  true
),
(
  'neptune',
  'Neptune',
  'The Distant Storm',
  'Neptune is the most distant planet in our solar system and the windiest. Winds on Neptune can reach 2,100 km/h — faster than the speed of sound on Earth. It was predicted mathematically before it was ever observed, a triumph of human intellect over darkness. Its largest moon Triton orbits in the opposite direction of Neptune''s rotation, suggesting it was captured from the Kuiper Belt. In 2011, Voyager 2 — the only spacecraft ever to visit — became the most distant human-made object we could still communicate with.',
  '4.3 billion km from Earth (avg)',
  'Neptune was found by mathematics alone, before anyone ever saw it. What do you believe in before you have proof?',
  null,
  true
)
on conflict (id) do nothing;
