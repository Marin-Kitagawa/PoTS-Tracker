# **App Name**: POTS Tracker

## Core Features:

- Exercise Tracking: Track structured endurance and resistance training, including type of exercise (horizontal/upright), frequency, duration, and RPE levels.
- Volume Expansion Monitoring: Log daily salt intake (up to 10g sodium) and fluid intake (up to 3L), with visual feedback on whether daily goals are met.
- Sleep Position Logging: Record sleep positions, specifically tracking whether the head is elevated 4-6 inches. This includes notification based reminders.
- Compression Garment Use: Track the use of compression garments (abdomen-high or full-lower-body), including duration and type.
- Physical Countermeasures Log: Log instances of using physical countermeasures like squeezing a rubber ball, leg crossing with muscle tensing, muscle pumping, squatting/sitting/lying down, and cough CPR with time stamps, and the app sends reminders if they did not do certain countermeasures during the whole day. LLM will function as a tool here
- Personalized Recommendations: LLM-based recommendations, such as dosage reminders
- Skin Surface Cooling Tracking: Tracks skin cooling usage with UI element based protocol notifications for reminders, showing frequency, cooling methods and usage conditions
- Database storage: Persistent backend that connects the app using Supabase

## Style Guidelines:

- Primary color: Light Blue (#ADD8E6) to evoke a sense of calmness and well-being.
- Background color: Very pale blue (#F0F8FF), almost white, for a clean, clinical feel (hue same as primary, saturation 10%, high brightness).
- Accent color: Soft Lavender (#E6E6FA) for interactive elements and highlights (analogous to light blue, and distinctly different in brightness/saturation).
- Font pairing: 'Belleza' (sans-serif) for headlines and 'Alegreya' (serif) for body text.
- Use clear, easily recognizable icons, potentially with subtle animations (Magic UI/Aceternity UI components where possible, ShadCN as fallback, plain TailwindCSS if nothing matches) to represent each tracked activity.
- A clean, card-based layout to present information in a clear and digestible manner.
- Subtle animations and transitions (if components like those of Magic UI are used) to provide feedback and enhance user engagement.