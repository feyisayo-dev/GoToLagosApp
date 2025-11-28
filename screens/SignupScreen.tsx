import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// --- THEME & COLORS ---
const COLORS = {
    primary: '#0B9B4D',       // Uber/Bolt-like Green
    primaryLight: '#00C26A',  // Lighter Green for accents/gradients
    background: '#F7F7F7',    // Soft Grey Background
    card: '#FFFFFF',          // White Card
    textDark: '#1D1D1D',      // Main Text
    textGrey: '#888888',      // Secondary Text
    border: '#E0E0E0',        // Subtle Borders
    error: '#FF4D4D',
    shadow: '#000000',
};

const { width } = Dimensions.get('window');

// --- COMPONENTS ---

// 1. Pulsing Brand Icon Header
const HeaderIcon = () => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(0.4)).current;

    useEffect(() => {
        Animated.loop(
            Animated.parallel([
                Animated.sequence([
                    Animated.timing(scaleAnim, {
                        toValue: 1.2,
                        duration: 2000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(scaleAnim, {
                        toValue: 1,
                        duration: 2000,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.sequence([
                    Animated.timing(opacityAnim, {
                        toValue: 0,
                        duration: 2000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(opacityAnim, {
                        toValue: 0.4,
                        duration: 2000,
                        useNativeDriver: true,
                    }),
                ])
            ])
        ).start();
    }, []);

    return (
        <View style={styles.headerContainer}>
            {/* Pulse Effect Background */}
            <Animated.View
                style={[
                    styles.pulseRing,
                    { transform: [{ scale: scaleAnim }], opacity: opacityAnim }
                ]}
            />
            {/* Main Icon */}
            <View style={styles.iconCircle}>
                <FontAwesome5 name="map-marker-alt" size={32} color="white" />
            </View>
            <Text style={styles.brandTitle}>Transit Flow</Text>
            <Text style={styles.brandSubtitle}>Smart routes. Smooth rides.</Text>
        </View>
    );
};

// 2. Custom Animated Input Field
const InputField = ({ icon, placeholder, isPassword = false, value, onChangeText }: any) => {
    const [isFocused, setIsFocused] = useState(false);
    const focusAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(focusAnim, {
            toValue: isFocused ? 1 : 0,
            duration: 200,
            useNativeDriver: false, // Color interpolation requires false
        }).start();
    }, [isFocused]);

    const borderColor = focusAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [COLORS.border, COLORS.primary],
    });

    const shadowOpacity = focusAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.1],
    });

    return (
        <Animated.View style={[
            styles.inputContainer,
            {
                borderColor: borderColor,
                shadowOpacity: shadowOpacity,
                // Elevation for Android glow effect
                elevation: isFocused ? 4 : 0,
            }
        ]}>
            <View style={styles.inputIcon}>
                <MaterialIcons
                    name={icon}
                    size={20}
                    color={isFocused ? COLORS.primary : COLORS.textGrey}
                />
            </View>
            <TextInput
                style={styles.textInput}
                placeholder={placeholder}
                placeholderTextColor={COLORS.textGrey}
                secureTextEntry={isPassword}
                value={value}
                onChangeText={onChangeText}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                autoCapitalize="none"
            />
            {isPassword && (
                <TouchableOpacity style={styles.eyeIcon}>
                    <Ionicons name="eye-off-outline" size={20} color={COLORS.textGrey} />
                </TouchableOpacity>
            )}
        </Animated.View>
    );
};

// 3. Primary Action Button
const PrimaryButton = ({ title, onPress }: any) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.96,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
        if (onPress) onPress();
    };

    return (
        <TouchableWithoutFeedback onPressIn={handlePressIn} onPressOut={handlePressOut}>
            <Animated.View style={[styles.primaryButton, { transform: [{ scale: scaleAnim }] }]}>
                <Text style={styles.primaryButtonText}>{title}</Text>
                <MaterialIcons name="arrow-forward" size={20} color="white" style={{ marginLeft: 8 }} />
            </Animated.View>
        </TouchableWithoutFeedback>
    );
};

// --- MAIN SCREEN ---
export default function SignupScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.keyboardView}
                >
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                        {/* Header Section */}
                        <HeaderIcon />

                        {/* Login Card */}
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Welcome back</Text>
                            <Text style={styles.cardSubtitle}>Enter your details to continue</Text>

                            {/* Inputs */}
                            <View style={styles.formSpace}>
                                <InputField
                                    icon="email"
                                    placeholder="Email or Phone Number"
                                    value={email}
                                    onChangeText={setEmail}
                                />
                                <View style={{ height: 16 }} />
                                <InputField
                                    icon="lock"
                                    placeholder="Password"
                                    isPassword={true}
                                    value={password}
                                    onChangeText={setPassword}
                                />
                            </View>

                            {/* Forgot Password */}
                            <TouchableOpacity style={styles.forgotContainer}>
                                <Text style={styles.forgotText}>Forgot Password?</Text>
                            </TouchableOpacity>

                            {/* Login Button */}
                            <View style={{ marginTop: 24 }}>
                                <PrimaryButton title="Log In" onPress={() => console.log("Login Pressed")} />
                            </View>

                            {/* Divider */}
                            <View style={styles.dividerContainer}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.dividerText}>or</Text>
                                <View style={styles.dividerLine} />
                            </View>

                            {/* Google Button */}
                            <TouchableOpacity style={styles.googleButton}>
                                <FontAwesome5 name="google" size={18} color={COLORS.textDark} />
                                <Text style={styles.googleButtonText}>Continue with Google</Text>
                            </TouchableOpacity>

                        </View>

                        {/* Footer */}
                        <View>
                            <View style={{ flexDirection: "row" }}>
                                <Text>I do have an account </Text>

                                {/* This will now work correctly */}
                                <TouchableOpacity onPress={() => router.push('/login')}>
                                    <Text style={{ color: "green" }}>Sign In</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </TouchableWithoutFeedback>
    );
}

// --- STYLES ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingBottom: 40,
    },

    // Header Styles
    headerContainer: {
        alignItems: 'center',
        marginBottom: 40,
        marginTop: 20,
    },
    pulseRing: {
        position: 'absolute',
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.primary,
        top: -8,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    brandTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: COLORS.textDark,
        letterSpacing: -0.5,
    },
    brandSubtitle: {
        fontSize: 16,
        color: COLORS.textGrey,
        marginTop: 4,
        fontWeight: '500',
    },

    // Card Styles
    card: {
        backgroundColor: COLORS.card,
        borderRadius: 24,
        padding: 30,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
        elevation: 4,
    },
    cardTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: COLORS.textDark,
        marginBottom: 8,
    },
    cardSubtitle: {
        fontSize: 14,
        color: COLORS.textGrey,
        marginBottom: 24,
    },
    formSpace: {
        marginBottom: 8,
    },

    // Input Styles
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FAFAFA',
        borderRadius: 14,
        borderWidth: 1.5,
        height: 56,
        paddingHorizontal: 16,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
    },
    inputIcon: {
        marginRight: 12,
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        color: COLORS.textDark,
        fontWeight: '500',
    },
    eyeIcon: {
        padding: 4,
    },

    // Button Styles
    forgotContainer: {
        alignSelf: 'flex-end',
        marginTop: 12,
    },
    forgotText: {
        color: COLORS.textGrey,
        fontSize: 13,
        fontWeight: '600',
    },
    primaryButton: {
        backgroundColor: COLORS.primary,
        height: 56,
        borderRadius: 14,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    primaryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },

    // Social & Divider
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.border,
    },
    dividerText: {
        marginHorizontal: 16,
        color: COLORS.textGrey,
        fontSize: 12,
        fontWeight: '600',
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
        borderRadius: 14,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    googleButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.textDark,
        marginLeft: 12,
    },

    // Footer
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 32,
    },
    footerText: {
        color: COLORS.textGrey,
        fontSize: 14,
    },
    footerLink: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: '700',
    },
});