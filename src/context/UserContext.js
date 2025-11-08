// MyContext.js
import { createContext } from 'react';
import { useContext } from 'react';

// Create the context with a default value.
// The default value is used when a component consumes the context
// without a corresponding Provider higher up in the component tree.
export const UserContext = createContext({}); 

// You can also create and export a custom hook to consume the context
// for better reusability and error handling.
// This is a common pattern, especially with larger applications.
export const useUserContext = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useMyContext must be used within a UserContextProvider');
  }
  return context;
};
