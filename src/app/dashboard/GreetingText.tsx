'use client';
import { useState, useEffect } from 'react';

export default function GreetingText({ name }: { name: string }) {
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  return <>{greeting ? `${greeting}, ${name}.` : `Hey, ${name}.`}</>;
}
