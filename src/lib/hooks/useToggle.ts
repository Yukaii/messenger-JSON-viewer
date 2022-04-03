import { useState } from 'react';

export default function useToggle(initialValue: boolean) {
  const [value, setValue] = useState(initialValue);

  const toggle = () => setValue(!value);

  return [value, setValue, toggle] as const;
}
