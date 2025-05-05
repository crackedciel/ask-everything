import { useEffect, useState } from 'react'

type Props = {
  text: string
  from?: string
  via?: string
  to?: string
  className?: string
}

export default function GradientText(props: Props) {
  const from = props.from || 'from-teal-500';
  const via = props.via || 'via-purple-500';
  const to = props.to || 'to-orange-500';
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    setDisplayedText('');

    let index = 0
    const timer = setInterval(() => {
      if (index < props.text.length) {
        setDisplayedText(props.text.substring(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [props.text]);

  return (
    <span
      className={`bg-gradient-to-r ${from} ${via} ${to} text-transparent bg-clip-text bg-300% animate-gradient ${props.className}`}
    >
      {displayedText.length ? displayedText : <div className='opacity-0'>{props.text}</div>}
    </span>
  )
}