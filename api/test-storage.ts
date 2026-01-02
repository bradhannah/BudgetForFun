import { StorageServiceImpl } from './src/services/storage';
console.log('StorageServiceImpl:', typeof StorageServiceImpl);
const instance = StorageServiceImpl.getInstance();
console.log('Instance created:', instance !== null);
