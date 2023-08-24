/**
 * File: pinecone-vercel-starter/src/app/components/Context/Button.tsx
 * 
 * This file defines the Button component. The Button component is a reusable component that is used throughout the application.
 * It accepts a className and other props as parameters, and returns a button element with the specified className and props.
 * The className is used to apply styles to the button, and the other props are spread onto the button element.
 * This allows for a flexible and customizable button that can be used in various contexts in the application.
 */

export function Button({ className, ...props }: any) {
  // The Button component accepts a className and other props as parameters.
  // The className is used to apply styles to the button.
  // The other props are spread onto the button element, allowing for a flexible and customizable button.
  return (
    <button
      className={
        // The className is combined with a string of class names to apply styles to the button.
        // The string of class names includes styles for layout, padding, text, transitions, and background color.
        "inline-flex items-center gap-2 justify-center rounded-md py-2 px-3 text-sm outline-offset-2 transition active:transition-none bg-zinc-600 font-semibold text-zinc-100 hover:bg-zinc-400 active:bg-zinc-800 active:text-zinc-100/70 " +
        className
      }
      {...props} // The other props are spread onto the button element.
    />
  );
}
