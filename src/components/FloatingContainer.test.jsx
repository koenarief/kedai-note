import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import FloatingContainer from './FloatingContainer';

describe('FloatingContainer Component', () => {
  
  test('harus me-render children yang diberikan', () => {
    render(
      <FloatingContainer>
        <button data-testid="child-button">Klik Saya</button>
      </FloatingContainer>
    );

    // Memastikan child element muncul di dalam container
    const childElement = screen.getByTestId('child-button');
    expect(childElement).toBeInTheDocument();
    expect(childElement).toHaveTextContent('Klik Saya');
  });

  test('harus memiliki kelas CSS Tailwind untuk posisi fixed di pojok kanan bawah', () => {
    const { container } = render(
      <FloatingContainer>
        <p>Konten</p>
      </FloatingContainer>
    );

    // Mengambil elemen div pertama (container utama)
    const mainDiv = container.firstChild;

    // Memastikan kelas-kelas penting ada
    expect(mainDiv).toHaveClass('fixed');
    expect(mainDiv).toHaveClass('bottom-4');
    expect(mainDiv).toHaveClass('right-4');
    expect(mainDiv).toHaveClass('z-50');
  });

  test('harus memiliki layout flex-col dan spacing antar elemen', () => {
    const { container } = render(
      <FloatingContainer>
        <div>Item 1</div>
        <div>Item 2</div>
      </FloatingContainer>
    );

    const mainDiv = container.firstChild;
    
    // Memastikan pengaturan layout vertikal
    expect(mainDiv).toHaveClass('flex');
    expect(mainDiv).toHaveClass('flex-col');
    expect(mainDiv).toHaveClass('space-y-3');
  });
});
