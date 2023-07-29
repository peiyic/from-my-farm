"use client";
import styles from './navigation.module.css'
import {useState, useMemo} from 'react';

const Navigation = () => {
    return <nav className={styles.navigation}>
        <a href="/" className={styles.title}>From My Farm</a>
        <div className={styles.sidebar}>things</div>
        </nav>
}


export default Navigation;