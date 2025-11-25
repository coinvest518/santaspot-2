import { Card, CardContent } from "./ui/card";
import { Star, Heart } from "lucide-react";

const testimonials = [
  {
    name: "The Johnson Family",
    text: "We were struggling to make ends meet this holiday season. The gift from Santa's Pot was a miracle. Thank you to everyone who donated.",
    rating: 5,
    location: "Ohio, USA"
  },
  {
    name: "Maria S.",
    text: "It feels so good to give back. Knowing my small donation is part of something so big and impactful is the best feeling.",
    rating: 5,
    location: "Community Giver"
  },
  {
    name: "David R.",
    text: "Sharing the link on my social media was so easy, and it was amazing to see my friends and family join in to help others. What a wonderful idea!",
    rating: 5,
    location: "Community Sharer"
  }
];

const Testimonials = () => {
  return (
    <div className="py-16 bg-white/90 backdrop-blur-sm">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Stories from Our Community</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-white/80 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1">
              <CardContent className="pt-6 flex flex-col items-center text-center">
                <Heart className="w-10 h-10 text-red-500 mb-4" fill="currentColor" />
                <p className="text-gray-700 mb-4 font-serif italic">"{testimonial.text}"</p>
                <div className="flex mb-2">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-500" />
                  ))}
                </div>
                <div className="text-center">
                  <strong className="text-gray-900">{testimonial.name}</strong>
                  <span className="block text-sm text-gray-500">{testimonial.location}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Testimonials;