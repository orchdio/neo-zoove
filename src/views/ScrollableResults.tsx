import { type ReactNode, useEffect, useRef, useState } from "react";

const ScrollableResults = ({
  children,
  isConverting,
}: { children: ReactNode; isConverting: boolean }) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const handleScroll = () => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;

    if (autoScroll !== isNearBottom) {
      setAutoScroll(isNearBottom);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (autoScroll && isConverting && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [children, isConverting, autoScroll]);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    setAutoScroll(true);
  };

  return (
    <div className="relative h-full">
      <div
        ref={containerRef}
        className="h-full max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 space-y-2"
        onScroll={handleScroll}
      >
        {children}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
export default ScrollableResults;
