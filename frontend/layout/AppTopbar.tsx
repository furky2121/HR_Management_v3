/* eslint-disable @next/next/no-img-element */

import Link from 'next/link';
import { classNames } from 'primereact/utils';
import React, { forwardRef, useContext, useImperativeHandle, useRef, useState, useEffect } from 'react';
import { AppTopbarRef } from '@/types';
import { LayoutContext } from './context/layoutcontext';
import { Avatar } from 'primereact/avatar';
import { Menu } from 'primereact/menu';
import authService from '../src/services/authService';
import fileUploadService from '../src/services/fileUploadService';

const AppTopbar = forwardRef<AppTopbarRef>((props, ref) => {
    const { layoutConfig, layoutState, onMenuToggle, showProfileSidebar } = useContext(LayoutContext);
    const menubuttonRef = useRef(null);
    const topbarmenuRef = useRef(null);
    const topbarmenubuttonRef = useRef(null);
    const profileMenuRef = useRef<Menu>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    useEffect(() => {
        console.log('🔥 REAL AppTopbar useEffect TRIGGERED!');
        // Gerçek kullanıcı bilgilerini localStorage'dan al
        const user = authService.getUser();
        console.log('REAL AppTopbar - user data:', user);
        if (user) {
            // Case-insensitive field access
            const personel = user.Personel || user.personel;
            console.log('REAL AppTopbar - personel data:', personel);
            console.log('REAL AppTopbar - fotografUrl:', personel?.FotografUrl || personel?.fotografUrl);
            
            setCurrentUser({
                ad: personel?.Ad || personel?.ad || 'Kullanıcı',
                soyad: personel?.Soyad || personel?.soyad || '',
                kullaniciAdi: user.kullaniciAdi,
                pozisyon: personel?.pozisyon?.ad || personel?.Pozisyon?.Ad || '',
                departman: personel?.pozisyon?.departman || personel?.Pozisyon?.Departman || '',
                fotografUrl: personel?.FotografUrl || personel?.fotografUrl || null,
                kademeSeviye: personel?.pozisyon?.kademe?.seviye || personel?.Pozisyon?.Kademe?.Seviye || 0
            });
        }
        
        // Avatar cache yenilendiğinde topbar'ı da yenile
        const handleAvatarRefresh = () => {
            const updatedUser = authService.getUser();
            console.log('REAL AppTopbar - Avatar refreshed, updated user:', updatedUser);
            if (updatedUser) {
                const personel = updatedUser.Personel || updatedUser.personel;
                setCurrentUser({
                    ad: personel?.Ad || personel?.ad || 'Kullanıcı',
                    soyad: personel?.Soyad || personel?.soyad || '',
                    kullaniciAdi: updatedUser.kullaniciAdi,
                    pozisyon: personel?.pozisyon?.ad || personel?.Pozisyon?.Ad || '',
                    departman: personel?.pozisyon?.departman || personel?.Pozisyon?.Departman || '',
                    fotografUrl: personel?.FotografUrl || personel?.fotografUrl || null,
                    kademeSeviye: personel?.pozisyon?.kademe?.seviye || personel?.Pozisyon?.Kademe?.Seviye || 0
                });
            }
        };

        // Avatar refresh event listener'ı ekle
        window.addEventListener('avatarRefresh', handleAvatarRefresh);
        
        return () => {
            window.removeEventListener('avatarRefresh', handleAvatarRefresh);
        };
    }, []);

    useImperativeHandle(ref, () => ({
        menubutton: menubuttonRef.current,
        topbarmenu: topbarmenuRef.current,
        topbarmenubutton: topbarmenubuttonRef.current
    }));

    const profileMenuItems = [
        {
            label: 'Profilim',
            icon: 'pi pi-user',
            command: () => {
                window.location.href = '/profil';
            }
        },
        {
            label: 'Şifre Değiştir',
            icon: 'pi pi-lock',
            command: () => {
                window.location.href = '/sifre-degistir';
            }
        },
        // Sadece Genel Müdür (seviye 1) için Ayarlar menüsü
        ...(currentUser?.kademeSeviye === 1 ? [{
            separator: true
        }, {
            label: 'Sistem Ayarları',
            icon: 'pi pi-cog',
            command: () => {
                window.location.href = '/ayarlar';
            }
        }] : []),
        {
            separator: true
        },
        {
            label: 'Çıkış Yap',
            icon: 'pi pi-sign-out',
            command: () => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/auth/login';
            }
        }
    ];

    const showProfileMenu = (event: React.MouseEvent) => {
        profileMenuRef.current?.toggle(event);
        setIsProfileMenuOpen(!isProfileMenuOpen);
    };

    return (
        <div className="layout-topbar">
            <Link href="/" className="layout-topbar-logo">
                <img src={`/layout/images/logo-${layoutConfig.colorScheme !== 'light' ? 'white' : 'dark'}.svg`} width="47.22px" height={'35px'} alt="logo" />
                <span>BilgeLojistik İK</span>
            </Link>

            <button ref={menubuttonRef} type="button" className="p-link layout-menu-button layout-topbar-button" onClick={onMenuToggle}>
                <i className="pi pi-bars" />
            </button>

            <button ref={topbarmenubuttonRef} type="button" className="p-link layout-topbar-menu-button layout-topbar-button" onClick={showProfileSidebar}>
                <i className="pi pi-ellipsis-v" />
            </button>

            <div ref={topbarmenuRef} className={classNames('layout-topbar-menu', { 'layout-topbar-menu-mobile-active': layoutState.profileSidebarVisible })}>
                {currentUser && (
                    <div className="layout-topbar-user" onClick={showProfileMenu} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem' }}>
                        {(() => {
                            console.log('REAL AppTopbar RENDER - currentUser:', currentUser);
                            console.log('REAL AppTopbar RENDER - fotografUrl:', currentUser.fotografUrl);
                            
                            if (currentUser.fotografUrl) {
                                const avatarUrl = fileUploadService.getAvatarUrl(currentUser.fotografUrl);
                                console.log('REAL AppTopbar RENDER - Final avatarUrl:', avatarUrl);
                                return (
                                    <Avatar 
                                        image={avatarUrl} 
                                        shape="circle" 
                                        size="normal"
                                        onImageError={(e: any) => {
                                            console.log('REAL Topbar avatar error:', e);
                                            console.log('REAL Topbar avatar URL that failed:', avatarUrl);
                                        }}
                                    />
                                );
                            } else {
                                return (
                                    <Avatar 
                                        label={currentUser.ad.charAt(0) + currentUser.soyad.charAt(0)}
                                        size="normal" 
                                        shape="circle"
                                        style={{ backgroundColor: '#2196F3', color: '#ffffff' }}
                                    />
                                );
                            }
                        })()}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                            <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                                {currentUser.ad} {currentUser.soyad}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-color-secondary)' }}>
                                {currentUser.pozisyon}
                            </span>
                        </div>
                        <i className={`pi ${isProfileMenuOpen ? 'pi-chevron-up' : 'pi-chevron-down'}`} 
                           style={{ fontSize: '0.75rem', color: 'var(--text-color-secondary)', marginLeft: '0.25rem' }}></i>
                    </div>
                )}
                
                <Menu 
                    ref={profileMenuRef} 
                    model={profileMenuItems} 
                    popup 
                    onHide={() => setIsProfileMenuOpen(false)}
                />
            </div>
        </div>
    );
});

AppTopbar.displayName = 'AppTopbar';

export default AppTopbar;
