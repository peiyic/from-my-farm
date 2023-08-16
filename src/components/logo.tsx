"use client";
import styles from './logo.module.css'
import {useState, useMemo} from 'react';

const Logo = () => {
    return <div className={styles.grid}><a className={styles.title} href='https://www.google.com'>From my Farm</a></div>
}


export default Logo;