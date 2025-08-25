/* eslint-disable @next/next/no-img-element */

import React, { useContext } from 'react';
import { LayoutContext } from './context/layoutcontext';

const AppFooter = () => {
    const { layoutConfig } = useContext(LayoutContext);

    return (
        <div className="layout-footer">
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '12px',
                fontSize: '14px',
                color: '#6b7280'
            }}>
                <span>
                    © {new Date().getFullYear()}, All rights reserved.
                </span>
                <span style={{ color: '#d1d5db' }}>|</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>Powered by</span>
                    <img 
                        src="/lionsoft.png" 
                        alt="Lionsoft Technology" 
                        height="28" 
                        style={{ objectFit: 'contain' }}
                    />
                </div>
            </div>
        </div>
    );
};

export default AppFooter;
