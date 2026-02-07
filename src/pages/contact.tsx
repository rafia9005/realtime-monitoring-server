import PublicLayout from "@/components/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Mail, Phone, MessageCircle, Send, Clock, MapPin,
    Sparkles, Check, Shield, Globe
} from "lucide-react";

export default function Contact() {
    return (
        <PublicLayout>
            <div className="w-full min-h-[calc(100vh-8rem)] flex flex-col items-center relative overflow-hidden">
                {/* Grid background */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

                {/* Hero Section */}
                <div className="relative z-10 mt-8 mb-6 animate-slideUp animate-delay-100">
                    <Badge variant="outline" className="px-4 py-2 text-sm bg-card/50 border-primary/20">
                        <Sparkles className="mr-2 w-4 h-4" /> Get in Touch
                    </Badge>
                </div>

                <div className="relative z-10 max-w-4xl mx-auto text-center px-4 mb-16 animate-slideUp animate-delay-200">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                        Let's <span className="gradient-text-primary">Talk</span>
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                        Multiple ways to reach us. Pick what works best for you.
                        We're always happy to hear from you.
                    </p>
                </div>

                {/* Contact Cards */}
                <div className="relative z-10 w-full max-w-6xl mx-auto px-4 mb-16">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Email */}
                        <Card className="bg-card/50 border-border/50 backdrop-blur-sm animate-slideUp animate-delay-300 overflow-hidden hover:border-blue-500/30 transition-all duration-300">
                            <CardContent className="p-8">
                                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-6">
                                    <Mail className="w-6 h-6 text-blue-500" />
                                </div>
                                <h3 className="text-xl font-semibold mb-1">Email Us</h3>
                                <p className="text-sm text-blue-500 font-medium mb-4">Primary</p>
                                <p className="text-lg font-semibold mb-4 break-all">projects.watchtower@gmail.com</p>
                                <p className="text-sm text-muted-foreground mb-6">Our main inbox. We typically respond within 2 hours during business days.</p>
                                <div className="space-y-2 mb-6">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Check className="w-4 h-4 text-green-500 shrink-0" />
                                        Average response: 2 hours
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Shield className="w-4 h-4 text-green-500 shrink-0" />
                                        Secure & confidential
                                    </div>
                                </div>
                                <a
                                    href="mailto:projects.watchtower@gmail.com"
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <Mail className="w-4 h-4" />
                                    Send Email
                                </a>
                            </CardContent>
                        </Card>

                        {/* Call */}
                        <Card className="bg-card/50 border-border/50 backdrop-blur-sm animate-slideUp animate-delay-400 overflow-hidden hover:border-cyan-500/30 transition-all duration-300">
                            <CardContent className="p-8">
                                <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-6">
                                    <Phone className="w-6 h-6 text-cyan-500" />
                                </div>
                                <h3 className="text-xl font-semibold mb-4">Call Us</h3>
                                <p className="text-2xl font-bold mb-2">+62 857-9126-8077</p>
                                <p className="text-sm text-muted-foreground mb-6">Mon-Fri, 9AM-10PM PST</p>
                                <a
                                    href="tel:+6285791268077"
                                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 rounded-lg transition-colors mb-6 flex items-center justify-center gap-2"
                                >
                                    <Phone className="w-4 h-4" />
                                    Call Now
                                </a>
                                <div className="bg-card/50 border border-border/50 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Clock className="w-5 h-5 text-cyan-500" />
                                        <h4 className="text-sm font-semibold">Business Hours</h4>
                                    </div>
                                    <div className="space-y-2 text-sm text-muted-foreground">
                                        <div className="flex justify-between">
                                            <span>Weekdays</span>
                                            <span>9:00 AM - 10:00 PM PST</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Weekends</span>
                                            <span>9:00 AM - 8:00 PM PST</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* WhatsApp */}
                        <Card className="bg-card/50 border-border/50 backdrop-blur-sm animate-slideUp animate-delay-500 overflow-hidden hover:border-green-500/30 transition-all duration-300">
                            <CardContent className="p-8">
                                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-6">
                                    <MessageCircle className="w-6 h-6 text-green-500" />
                                </div>
                                <h3 className="text-xl font-semibold mb-1">WhatsApp</h3>
                                <p className="text-sm text-green-500 font-medium mb-4">Instant messaging</p>
                                <p className="text-sm text-muted-foreground mb-6">Chat with our support team in real-time for instant assistance.</p>
                                <a
                                    href="https://wa.me/6285791268077"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <Send className="w-4 h-4" />
                                    Message
                                </a>
                                <div className="bg-card/50 border border-border/50 rounded-lg p-4 mt-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Clock className="w-5 h-5 text-green-600" />
                                        <h4 className="text-sm font-semibold">Business Hours</h4>
                                    </div>
                                    <div className="space-y-2 text-sm text-muted-foreground">
                                        <div className="flex justify-between">
                                            <span>Weekdays</span>
                                            <span>9:00 AM - 10:00 PM PST</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Weekends</span>
                                            <span>9:00 AM - 8:00 PM PST</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Contact Form Section */}
                <div className="relative z-10 w-full max-w-4xl mx-auto px-4 mb-16 animate-slideUp animate-delay-600">
                    <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                        <CardContent className="p-8 md:p-12">
                            <div className="text-center mb-10">
                                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                    Send us a <span className="gradient-text-primary">Message</span>
                                </h2>
                                <p className="text-muted-foreground">
                                    Fill out the form below and we'll get back to you as soon as possible.
                                </p>
                            </div>

                            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            placeholder="John Doe"
                                            className="w-full px-4 py-3 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Email Address</label>
                                        <input
                                            type="email"
                                            placeholder="john@example.com"
                                            className="w-full px-4 py-3 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Subject</label>
                                    <input
                                        type="text"
                                        placeholder="How can we help?"
                                        className="w-full px-4 py-3 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Message</label>
                                    <textarea
                                        rows={5}
                                        placeholder="Tell us more about your project or inquiry..."
                                        className="w-full px-4 py-3 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    size="lg"
                                    className="w-full bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-400 hover:to-blue-500 text-white py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
                                >
                                    <Send className="w-5 h-5 mr-2" />
                                    Send Message
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Location & Info */}
                <div className="relative z-10 w-full max-w-6xl mx-auto px-4 mb-16 animate-slideUp animate-delay-700">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="bg-card/30 border-border/50 backdrop-blur-sm hover:bg-card/50 transition-all duration-300">
                            <CardContent className="p-6 text-center">
                                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                                    <MapPin className="w-6 h-6 text-blue-500" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Location</h3>
                                <p className="text-sm text-muted-foreground">Indonesia</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-card/30 border-border/50 backdrop-blur-sm hover:bg-card/50 transition-all duration-300">
                            <CardContent className="p-6 text-center">
                                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                                    <Clock className="w-6 h-6 text-green-500" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Response Time</h3>
                                <p className="text-sm text-muted-foreground">Within 2 hours on business days</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-card/30 border-border/50 backdrop-blur-sm hover:bg-card/50 transition-all duration-300">
                            <CardContent className="p-6 text-center">
                                <div className="w-12 h-12 bg-violet-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                                    <Globe className="w-6 h-6 text-violet-500" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Available</h3>
                                <p className="text-sm text-muted-foreground">Worldwide, remote-first team</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="relative z-10 w-full max-w-4xl mx-auto px-4 mb-16 animate-slideUp animate-delay-700">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Frequently Asked <span className="gradient-text-primary">Questions</span>
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {[
                            { q: "How quickly do you respond?", a: "We typically respond within 2 hours during business days (Mon-Fri, 9AM-10PM PST). For urgent matters, WhatsApp is the fastest way to reach us." },
                            { q: "Do you offer custom monitoring solutions?", a: "Yes! We work with businesses of all sizes to create tailored monitoring setups. Contact us to discuss your specific needs." },
                            { q: "Is there a free tier available?", a: "Watchtower offers a free tier with essential monitoring features. Premium plans unlock advanced analytics, alerts, and extended data retention." },
                            { q: "Can I integrate Watchtower with my existing tools?", a: "Absolutely. Watchtower provides RESTful APIs and WebSocket support for seamless integration with your existing infrastructure and workflows." },
                        ].map((faq, index) => (
                            <Card key={index} className="bg-card/30 border-border/50 backdrop-blur-sm">
                                <CardContent className="p-6">
                                    <h3 className="text-lg font-semibold mb-2">{faq.q}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
