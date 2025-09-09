/* eslint-disable @next/next/no-img-element */

import React, { useContext, useState, useEffect } from 'react';
import AppMenuitem from './AppMenuitem';
import { LayoutContext } from './context/layoutcontext';
import { MenuProvider } from './context/menucontext';
import Link from 'next/link';
import { AppMenuItem } from '@/types';
import yetkiService from '../src/services/yetkiService';

const AppMenu = () => {
    const { layoutConfig } = useContext(LayoutContext);
    const [filteredModel, setFilteredModel] = useState<AppMenuItem[]>([]);

    const fullModel: AppMenuItem[] = [
        {
            label: 'ANA MENÜ',
            items: [
                { label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/', screenCode: 'dashboard' },
                { label: 'Bana Atanan Eğitimler', icon: 'pi pi-fw pi-play-circle', to: '/bana-atanan-egitimler', screenCode: 'egitimler' }
            ]
        },
        {
            label: 'İnsan Kaynakları',
            items: [
                {
                    label: 'Organizasyon',
                    icon: 'pi pi-fw pi-sitemap',
                    items: [
                        { label: 'Organizasyon Şeması', icon: 'pi pi-fw pi-share-alt', to: '/organizasyon-semasi', screenCode: 'organizasyon-semasi' },
                        { label: 'Kademeler', icon: 'pi pi-fw pi-list', to: '/kademeler', screenCode: 'kademeler' },
                        { label: 'Departmanlar', icon: 'pi pi-fw pi-building', to: '/departmanlar', screenCode: 'departmanlar' },
                        { label: 'Pozisyonlar', icon: 'pi pi-fw pi-briefcase', to: '/pozisyonlar', screenCode: 'pozisyonlar' }
                    ]
                },
                {
                    label: 'Personel Yönetimi',
                    icon: 'pi pi-fw pi-users',
                    items: [
                        { label: 'Personeller', icon: 'pi pi-fw pi-user', to: '/personeller', screenCode: 'personeller' }
                    ]
                },
                {
                    label: 'İzin İşlemleri',
                    icon: 'pi pi-fw pi-calendar',
                    items: [
                        { label: 'İzin Talepleri', icon: 'pi pi-fw pi-calendar-minus', to: '/izin-talepleri', screenCode: 'izin-talepleri' },
                        { label: 'İzin Takvimi', icon: 'pi pi-fw pi-calendar-plus', to: '/izin-takvimi', screenCode: 'izin-takvimi' },
                        { label: 'Onay Bekleyen İzin İşlemleri', icon: 'pi pi-fw pi-clock', to: '/onay-bekleyen-izin-islemleri', screenCode: 'bekleyen-izin-talepleri' }
                    ]
                },
                {
                    label: 'Eğitim Yönetimi',
                    icon: 'pi pi-fw pi-graduation-cap',
                    items: [
                        { label: 'Video Eğitimler', icon: 'pi pi-fw pi-play', to: '/egitimler', screenCode: 'egitimler' },
                        { label: 'Kategori Yönetimi', icon: 'pi pi-fw pi-th-large', to: '/kategori-yonetimi', screenCode: 'kategori-yonetimi' },
                        { label: 'Eğitim Katılımları', icon: 'pi pi-fw pi-users', to: '/egitim-katilimlari', screenCode: 'egitim-katilimlari' },
                        { label: 'Eğitim Raporları', icon: 'pi pi-fw pi-chart-bar', to: '/egitim-raporlari', screenCode: 'egitim-raporlari' },
                        { label: 'Sertifikalar', icon: 'pi pi-fw pi-verified', to: '/sertifikalar', screenCode: 'sertifikalar' }
                    ]
                },
                {
                    label: 'Zimmet Yönetimi',
                    icon: 'pi pi-fw pi-box',
                    items: [
                        { label: 'Zimmet Stok', icon: 'pi pi-fw pi-list', to: '/zimmet-stok', screenCode: 'zimmet-stok' },
                        { label: 'Zimmet Stok Onay Bekleyenler', icon: 'pi pi-fw pi-clock', to: '/zimmet-stok-onay', screenCode: 'zimmet-stok-onay' },
                        { label: 'Personel Zimmet İşlemleri', icon: 'pi pi-fw pi-user-plus', to: '/personel-zimmet', screenCode: 'personel-zimmet' }
                    ]
                },
                { label: 'Personel Giriş-Çıkış', icon: 'pi pi-fw pi-clock', to: '/personel-giris-cikis', screenCode: 'personel-giris-cikis' }
            ]
        },
        {
            label: 'Diğer İşlemler',
            icon: 'pi pi-fw pi-briefcase',
            items: [
                { label: 'Avans Talepleri', icon: 'pi pi-fw pi-dollar', to: '/avans-talepleri', screenCode: 'avans-talepleri' },
                { label: 'Avans Onay', icon: 'pi pi-fw pi-check-circle', to: '/avans-onay', screenCode: 'avans-onay' },
                { label: 'İstifa İşlemleri', icon: 'pi pi-fw pi-sign-out', to: '/istifa-islemleri', screenCode: 'istifa-islemleri' },
                { label: 'İstifa Onay', icon: 'pi pi-fw pi-times-circle', to: '/istifa-onay', screenCode: 'istifa-onay' }
            ]
        },
        {
            label: 'Sistem',
            items: [
                { label: 'Ayarlar', icon: 'pi pi-fw pi-cog', to: '/ayarlar', screenCode: 'ayarlar' }
            ]
        }
    ];

    useEffect(() => {
        // Load user permissions when component mounts
        yetkiService.loadUserPermissions().then((permissions) => {
            console.log('AppMenu - Loaded permissions:', permissions?.length || 0, 'items');
            const filtered = filterMenuByPermissions(fullModel);
            console.log('AppMenu - Filtered menu items:', filtered.length, 'main sections');
            setFilteredModel(filtered);
        }).catch((error) => {
            console.warn('AppMenu - Permission loading failed, showing full menu:', error.message);
            // If permission loading fails, show basic menu
            setFilteredModel(fullModel);
        });
    }, []);

    const filterMenuByPermissions = (menuItems: AppMenuItem[]): AppMenuItem[] => {
        return menuItems.map(item => {
            const filteredItem = { ...item };

            if (item.items) {
                // Filter sub-items recursively
                const filteredSubItems = filterMenuByPermissions(item.items);
                
                // Only keep parent if it has visible sub-items
                if (filteredSubItems.length > 0) {
                    filteredItem.items = filteredSubItems;
                    return filteredItem;
                } else {
                    return null;
                }
            } else if (item.screenCode) {
                // Check if user has permission for this screen
                const hasPermission = yetkiService.hasScreenPermission(item.screenCode, 'read');
                console.log(`AppMenu - Permission check: ${item.screenCode} = ${hasPermission}`);
                return hasPermission ? filteredItem : null;
            } else {
                // No screenCode, allow by default
                return filteredItem;
            }
        }).filter(item => item !== null) as AppMenuItem[];
    };

    return (
        <MenuProvider>
            <ul className="layout-menu">
                {filteredModel.map((item, i) => {
                    return !item?.seperator ? <AppMenuitem item={item} root={true} index={i} key={item.label} /> : <li className="menu-separator"></li>;
                })}
            </ul>
        </MenuProvider>
    );
};

export default AppMenu;
