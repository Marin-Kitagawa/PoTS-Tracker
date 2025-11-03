'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';
import React from 'react';

const detailsContent = [
  {
    value: 'exercise',
    title: 'Exercise Training',
    description: 'A cornerstone of POTS management, aimed at improving blood volume, heart function, and vascular tone.',
    content: [
      {
        subtitle: 'Core Principles',
        points: [
          'Start low and go slow to avoid symptom flares.',
          'Consistency is more important than intensity.',
          'Focus on reconditioning the body, not on athletic performance.',
          'A typical program lasts 3-6 months, but benefits are seen with continued activity.',
        ],
      },
      {
        subtitle: 'Types of Exercise',
        points: [
          '**Horizontal/Recumbent (Start Here):** Rowing, recumbent cycling, and swimming. These exercises minimize the effects of gravity, allowing you to build a base level of fitness without triggering symptoms.',
          '**Upright Exercise:** As you get stronger, gradually introduce upright activities like walking (especially on a treadmill for a controlled environment), elliptical training, or upright cycling.',
          '**Resistance Training:** Focus on the lower body and core to help the muscle pump return blood to the heart. Examples include seated leg press, leg curls, calf raises, and core exercises like planks and bridges.',
        ],
      },
      {
        subtitle: 'Rate of Perceived Exertion (RPE)',
        points: [
          'Use the RPE scale (1-10) to guide intensity instead of heart rate, which can be unreliable in POTS.',
          'Aim for an RPE of 2-4 (light to somewhat hard) when starting out.',
        ],
      },
    ],
  },
  {
    value: 'volume-expansion',
    title: 'Volume Expansion (Salt and Fluid)',
    description: 'Increasing blood volume is a primary goal to combat hypovolemia (low blood volume) common in POTS.',
    content: [
      {
        subtitle: 'Fluid Intake',
        points: [
          'Aim for 2-3 liters of water or other fluids per day.',
          'Drink fluids consistently throughout the day, not just when thirsty.',
          'A large glass of water first thing in the morning can help with morning symptoms.',
        ],
      },
      {
        subtitle: 'Sodium (Salt) Intake',
        points: [
          'Most POTS patients are advised to consume 3,000-10,000 mg of sodium (equivalent to 8-25 grams of salt) per day.',
          '**Important:** This high sodium intake should ONLY be done under the guidance of a physician, as it can be harmful for individuals with kidney disease or high blood pressure.',
          'Sources include salt tablets, electrolyte drinks, and liberal use of table salt on food.',
        ],
      },
    ],
  },
  {
    value: 'sleep',
    title: 'Sleep Position',
    description: 'Optimizing sleep can help manage morning symptoms, which are often the worst part of the day.',
    content: [
      {
        subtitle: 'Elevate the Head of the Bed',
        points: [
          'Raise the head of your bed by 4-6 inches using blocks or a wedge.',
          'This uses gravity overnight to help your body retain more blood volume and recalibrate the hormones that regulate it (renin-angiotensin-aldosterone system).',
          'Piling up pillows is less effective as you can slide off them during the night.',
        ],
      },
    ],
  },
  {
    value: 'compression',
    title: 'Compression Garments',
    description: 'External compression helps prevent blood from pooling in the lower body and abdomen.',
    content: [
      {
        subtitle: 'Types and Efficacy',
        points: [
          '**Abdomen and Thigh-High Compression is Key:** The most effective garments provide at least 30-40 mmHg of pressure and cover both the abdomen and the legs.',
          '**Garment Types:** Look for abdomen-high compression stockings, or a combination of thigh-high stockings and an abdominal binder.',
          '**Why it Works:** A significant amount of blood pools in the splanchnic (gut) circulation. Compressing the abdomen is crucial for effectiveness.',
          'Put garments on first thing in the morning before getting out of bed for the best results.',
        ],
      },
    ],
  },
  {
    value: 'countermeasures',
    title: 'Physical Countermeasures',
    description: 'These are simple maneuvers that use muscle contraction to pump blood back up to the heart and brain, temporarily relieving symptoms.',
    content: [
        {
            subtitle: 'Common Maneuvers',
            points: [
                '**Leg Crossing and Tensing:** Cross your legs while standing and tense the muscles in your legs and buttocks.',
                '**Muscle Pumping:** Go up on your tiptoes or rock back and forth on your feet.',
                '**Squeezing:** Tightly squeeze a rubber ball or your fists.',
                '**Squatting or Lowering:** If you feel faint, squatting down or sitting can quickly alleviate symptoms by reducing the effect of gravity.'
            ]
        }
    ]
  },
    {
    value: 'cooling',
    title: 'Skin Surface Cooling',
    description: 'Heat intolerance is a major symptom for many with POTS. Staying cool can help prevent symptom triggers.',
    content: [
        {
            subtitle: 'Cooling Strategies',
            points: [
                'Use cooling vests, neck wraps, or spray bottles with a fan.',
                'Take cool showers.',
                'Stay in air-conditioned environments during hot weather.',
                'Applying cold packs to the back of the neck or wrists can provide quick relief.'
            ]
        }
    ]
  }
];

export default function DetailsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">POTS Management Details</h1>
        <p className="text-muted-foreground">Detailed information on non-pharmacological POTS treatment strategies.</p>
      </div>
      <Card>
        <CardContent className="p-6">
          <Accordion type="single" collapsible className="w-full">
            {detailsContent.map((item) => (
              <AccordionItem value={item.value} key={item.value}>
                <AccordionTrigger className="text-lg">{item.title}</AccordionTrigger>
                <AccordionContent className="pt-2">
                    <p className="text-muted-foreground mb-4">{item.description}</p>
                    {item.content.map((section, index) => (
                        <div key={index} className="mb-4">
                            <h4 className="font-semibold text-md mb-2">{section.subtitle}</h4>
                            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                                {section.points.map((point, pIndex) => (
                                    <li key={pIndex}>
                                      <ReactMarkdown components={{ p: React.Fragment }}>{point}</ReactMarkdown>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
