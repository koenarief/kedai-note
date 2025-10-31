import React from 'react';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
    return (
        <div>
            <header>MainLayout Header</header>
            <main>
                <Outlet /> {/* Renders the child route component */}
            </main>
            <footer>MainLayout Footer</footer>
        </div>
    );
};

export default MainLayout;