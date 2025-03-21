import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FormLabel } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { SiVisa, SiMastercard, SiPaypal, SiGooglepay, SiApplepay } from "react-icons/si";
import { FiSmartphone, FiCreditCard, FiDollarSign, FiPhone } from "react-icons/fi";

export type PaymentGateway = "stripe" | "payfast" | "paytoday" | "dop";

interface PaymentGatewaySelectorProps {
  selectedGateway: PaymentGateway;
  onSelect: (gateway: PaymentGateway) => void;
}

export default function PaymentGatewaySelector({ 
  selectedGateway, 
  onSelect 
}: PaymentGatewaySelectorProps) {
  return (
    <RadioGroup 
      value={selectedGateway}
      onValueChange={(value) => onSelect(value as PaymentGateway)}
      className="space-y-3"
    >
      {/* Stripe */}
      <Card className={`border ${selectedGateway === "stripe" ? "border-primary" : "border-gray-200"} rounded-md transition-colors duration-200 overflow-hidden`}>
        <div className="flex items-center p-4">
          <RadioGroupItem value="stripe" id="stripe" className="mr-3"/>
          <FormLabel htmlFor="stripe" className="flex-1 flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-medium">Credit or Debit Card</p>
              <p className="text-sm text-gray-500">Pay securely with your card</p>
            </div>
            <div className="flex space-x-2">
              <SiVisa className="h-6 w-8 text-blue-700" />
              <SiMastercard className="h-6 w-8 text-red-500" />
              <SiPaypal className="h-6 w-8 text-blue-800" />
              <SiGooglepay className="h-6 w-8 text-gray-700" />
              <SiApplepay className="h-6 w-8 text-black" />
            </div>
          </FormLabel>
        </div>
      </Card>
      
      {/* PayFast */}
      <Card className={`border ${selectedGateway === "payfast" ? "border-primary" : "border-gray-200"} rounded-md transition-colors duration-200 overflow-hidden`}>
        <div className="flex items-center p-4">
          <RadioGroupItem value="payfast" id="payfast" className="mr-3"/>
          <FormLabel htmlFor="payfast" className="flex-1 flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-medium">PayFast</p>
              <p className="text-sm text-gray-500">Fast and secure local payments</p>
            </div>
            <div className="flex items-center justify-center h-8 w-16 bg-teal-600 text-white font-bold rounded">
              Pay<span className="text-yellow-300">Fast</span>
            </div>
          </FormLabel>
        </div>
      </Card>
      
      {/* PayToday */}
      <Card className={`border ${selectedGateway === "paytoday" ? "border-primary" : "border-gray-200"} rounded-md transition-colors duration-200 overflow-hidden`}>
        <div className="flex items-center p-4">
          <RadioGroupItem value="paytoday" id="paytoday" className="mr-3"/>
          <FormLabel htmlFor="paytoday" className="flex-1 flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-medium">Pay Today</p>
              <p className="text-sm text-gray-500">Pay using your mobile phone</p>
            </div>
            <div className="flex items-center space-x-1">
              <FiSmartphone className="h-6 w-6 text-purple-600" />
              <span className="font-bold text-purple-600">PayToday</span>
            </div>
          </FormLabel>
        </div>
      </Card>
      
      {/* DOP */}
      <Card className={`border ${selectedGateway === "dop" ? "border-primary" : "border-gray-200"} rounded-md transition-colors duration-200 overflow-hidden`}>
        <div className="flex items-center p-4">
          <RadioGroupItem value="dop" id="dop" className="mr-3"/>
          <FormLabel htmlFor="dop" className="flex-1 flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-medium">Digital Online Payments</p>
              <p className="text-sm text-gray-500">Secure and convenient digital payments</p>
            </div>
            <div className="flex items-center space-x-1">
              <FiDollarSign className="h-6 w-6 text-green-600" />
              <span className="font-bold text-green-600">DOP</span>
            </div>
          </FormLabel>
        </div>
      </Card>
    </RadioGroup>
  );
}