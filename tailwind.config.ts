
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '1.5rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['Inter var', 'Inter', 'sans-serif'],
				cyber: ['Orbitron', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				tech: {
					blue: '#0EA5E9',
					purple: '#8B5CF6',
					cyan: '#06B6D4',
					pink: '#EC4899',
					neon: '#39FF14',
					glow: '#00FFFF',
					dark: '#0F172A',
					slate: '#1E293B'
				},
				cyber: {
					primary: '#FF2A6D',
					secondary: '#05D9E8',
					accent: '#D1F7FF',
					dark: '#01012B',
					light: '#7DF9FF',
					highlight: '#005678'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'fade-in': {
					from: { opacity: '0' },
					to: { opacity: '1' }
				},
				'fade-up': {
					from: { opacity: '0', transform: 'translateY(10px)' },
					to: { opacity: '1', transform: 'translateY(0)' }
				},
				'scale-in': {
					from: { opacity: '0', transform: 'scale(0.95)' },
					to: { opacity: '1', transform: 'scale(1)' }
				},
				'pulse-slow': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.8' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-5px)' }
				},
				'glow': {
					'0%, 100%': { 
						'box-shadow': '0 0 5px rgba(14, 165, 233, 0.2), 0 0 20px rgba(14, 165, 233, 0.2)' 
					},
					'50%': { 
						'box-shadow': '0 0 10px rgba(14, 165, 233, 0.5), 0 0 30px rgba(14, 165, 233, 0.3)' 
					}
				},
				'shimmer': {
					'0%': { backgroundPosition: '-500px 0' },
					'100%': { backgroundPosition: '500px 0' }
				},
				'neon-pulse': {
					'0%, 100%': { 
						'box-shadow': '0 0 5px #0EA5E9, 0 0 10px #0EA5E9, 0 0 15px #0EA5E9, 0 0 20px #0EA5E9'
					},
					'50%': { 
						'box-shadow': '0 0 10px #8B5CF6, 0 0 20px #8B5CF6, 0 0 30px #8B5CF6, 0 0 40px #8B5CF6'
					}
				},
				'cyber-glitch': {
					'0%, 100%': { transform: 'translate(0)' },
					'20%': { transform: 'translate(-2px, 2px)' },
					'40%': { transform: 'translate(-2px, -2px)' },
					'60%': { transform: 'translate(2px, 2px)' },
					'80%': { transform: 'translate(2px, -2px)' }
				},
				'cyber-scan': {
					'0%': { 
						backgroundPosition: '0% 0%',
						opacity: '0.2'
					},
					'50%': { 
						backgroundSize: '100% 100%',
						opacity: '0.5'
					},
					'100%': {
						backgroundPosition: '100% 100%',
						opacity: '0.2'
					}
				},
				'holo-gradient': {
					'0%': { background: 'linear-gradient(45deg, #0EA5E9, #8B5CF6)' },
					'25%': { background: 'linear-gradient(45deg, #8B5CF6, #EC4899)' },
					'50%': { background: 'linear-gradient(45deg, #EC4899, #06B6D4)' },
					'75%': { background: 'linear-gradient(45deg, #06B6D4, #0EA5E9)' },
					'100%': { background: 'linear-gradient(45deg, #0EA5E9, #8B5CF6)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'fade-up': 'fade-up 0.4s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
				'pulse-slow': 'pulse-slow 3s infinite ease-in-out',
				'float': 'float 6s infinite ease-in-out',
				'glow': 'glow 2s infinite ease-in-out',
				'shimmer': 'shimmer 2s infinite linear',
				'neon-pulse': 'neon-pulse 2s infinite ease-in-out',
				'cyber-glitch': 'cyber-glitch 0.5s infinite ease-in-out',
				'cyber-scan': 'cyber-scan 8s infinite linear',
				'holo-gradient': 'holo-gradient 10s infinite ease'
			},
			backgroundImage: {
				'gradient-tech': 'linear-gradient(90deg, hsla(221, 45%, 73%, 1) 0%, hsla(220, 78%, 29%, 1) 100%)',
				'gradient-purple-pink': 'linear-gradient(90deg, hsla(277, 75%, 84%, 1) 0%, hsla(297, 50%, 51%, 1) 100%)',
				'gradient-blue-cyan': 'linear-gradient(90deg, hsla(186, 33%, 94%, 1) 0%, hsla(216, 41%, 79%, 1) 100%)',
				'cyber-grid': 'linear-gradient(to right, rgba(57, 255, 20, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(57, 255, 20, 0.1) 1px, transparent 1px)',
				'cyber-glow': 'radial-gradient(circle, rgba(57, 255, 20, 0.3) 0%, transparent 70%)',
				'cyber-scan-line': 'linear-gradient(to bottom, transparent, rgba(6, 182, 212, 0.5) 50%, transparent)',
				'matrix-rain': 'linear-gradient(180deg, rgba(0, 255, 255, 0.1) 0%, rgba(0, 255, 255, 0.05) 100%)',
				'holographic': 'linear-gradient(135deg, rgba(14, 165, 233, 0.5) 0%, rgba(139, 92, 246, 0.5) 50%, rgba(236, 72, 153, 0.5) 100%)',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
