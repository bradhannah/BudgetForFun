import { ValidationServiceImpl } from './src/services/validation';
console.log('ValidationServiceImpl:', typeof ValidationServiceImpl);
const instance = ValidationServiceImpl.getInstance();
console.log('Instance created:', instance !== null);
