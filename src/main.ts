import './style.css';
import { mountApp } from './ui/app';
import { createCharts } from './ui/charts';

mountApp(document.getElementById('app')!, createCharts);
