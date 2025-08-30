import { useEffect, useRef } from 'react';

const useScroll = (dependencies: any[]) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollToBottom = () => {
      if (containerRef.current) {
        containerRef.current.scrollTo({
          top: containerRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }
    };

    scrollToBottom();
  }, [...dependencies, containerRef]);

  return containerRef;
};

export default useScroll;
