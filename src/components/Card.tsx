import React from 'react';

/**
 * Card Component
 * 
 * A reusable container component that adds a white background, shadow, and rounded corners
 * Think of it like a "box" or "panel" to organize content
 * 
 * Example usage:
 * <Card>
 *   <CardHeader>My Title</CardHeader>
 *   <CardContent>My content goes here</CardContent>
 * </Card>
 */

// TypeScript interface: defines what props (inputs) this component accepts
interface CardProps {
  children: React.ReactNode;  // The content to display inside the card
  className?: string;         // Optional additional CSS classes (the ? means optional)
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    // Combine base styles with any custom classes passed in
    <div className={`bg-white overflow-hidden shadow rounded-lg ${className}`}>
      {children}  {/* Render whatever content was passed between <Card></Card> */}
    </div>
  );
};

/**
 * CardHeader Component
 * 
 * The top section of a card, usually containing a title
 * Has padding and a bottom border to separate it from the content
 */
interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => {
  return <div className={`px-4 py-5 sm:px-6 border-b border-gray-200 ${className}`}>{children}</div>;
};

/**
 * CardContent Component
 * 
 * The main content area of a card
 * Has padding to add space around the content
 */
interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => {
  return <div className={`px-4 py-5 sm:p-6 ${className}`}>{children}</div>;
};
