import { defineConfig } from 'vite';

const config = () => {
    return defineConfig({
        base: './',
        server: {
            host: 'localhost',
            port: 7800
        }
    });
};

export default config;
