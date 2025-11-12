// FloatingContainer.jsx
import React from "react";
import PropTypes from "prop-types";

const FloatingContainer = ({ children }) => {
  return (
    // 1. **fixed**: Menggunakan posisi tetap (fixed) agar selalu berada di viewport.
    // 2. **bottom-4**: Jarak 4 unit (sekitar 16px) dari bawah layar.
    // 3. **right-4**: Jarak 4 unit (sekitar 16px) dari kanan layar.
    // 4. **z-50**: Mengatur z-index tinggi agar selalu berada di atas elemen lain.
    // 5. **p-4**: Padding untuk isi container.
    <div
      className="
        fixed 
        bottom-4 
        right-4 
        z-50 
        p-4
        flex 
        flex-col 
        items-end 
        space-y-3
      "
    >
      {children}
    </div>
  );
};

FloatingContainer.propTypes = {
  children: PropTypes.node.isRequired, // Or PropTypes.node if not always required
};

export default FloatingContainer;
