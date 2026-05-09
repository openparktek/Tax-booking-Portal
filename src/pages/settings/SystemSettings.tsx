import { useState } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Save } from "lucide-react";
import PickupLocationsManager from "../../components/PickupLocationsManager";

export default function SystemSettings() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-gray-900 mb-1">System Settings</h1>
          <p className="text-gray-600">
            Configure system parameters and preferences
          </p>
        </div>
        <Button>
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      {/* Pickup Locations Manager - Full Width */}
      <div className="mb-6">
        <PickupLocationsManager />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* User & Roles */}
        <Card className="p-6">
          <h3 className="text-gray-900 mb-4">User & Roles</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="default-role">Default User Role</Label>
              <Select defaultValue="viewer">
                <SelectTrigger id="default-role" className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
              <Input
                id="session-timeout"
                type="number"
                defaultValue="30"
                className="mt-1.5"
              />
            </div>
            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="text-sm text-gray-900">
                  Require Email Verification
                </p>
                <p className="text-xs text-gray-600">
                  Users must verify email before accessing
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </Card>

        {/* System Parameters */}
        <Card className="p-6">
          <h3 className="text-gray-900 mb-4">System Parameters</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="booking-timeout">Booking Timeout (minutes)</Label>
              <Input
                id="booking-timeout"
                type="number"
                defaultValue="15"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="geofence-radius">Geofence Radius (meters)</Label>
              <Input
                id="geofence-radius"
                type="number"
                defaultValue="500"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="max-wait-time">Max Wait Time (minutes)</Label>
              <Input
                id="max-wait-time"
                type="number"
                defaultValue="20"
                className="mt-1.5"
              />
            </div>
          </div>
        </Card>

        {/* Security */}
        <Card className="p-6">
          <h3 className="text-gray-900 mb-4">Security</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-900">Two-Factor Authentication</p>
                <p className="text-xs text-gray-600">
                  Require 2FA for all admin users
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-900">IP Whitelist</p>
                <p className="text-xs text-gray-600">
                  Restrict access to specific IP addresses
                </p>
              </div>
              <Switch />
            </div>
            <div>
              <Label htmlFor="password-expiry">
                Password Expiry (days)
              </Label>
              <Input
                id="password-expiry"
                type="number"
                defaultValue="90"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="min-password-length">
                Minimum Password Length
              </Label>
              <Input
                id="min-password-length"
                type="number"
                defaultValue="8"
                className="mt-1.5"
              />
            </div>
          </div>
        </Card>

        {/* Kiosk Settings */}
        <Card className="p-6">
          <h3 className="text-gray-900 mb-4">Kiosk Settings</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="kiosk-language">Default Language</Label>
              <Select defaultValue="en">
                <SelectTrigger id="kiosk-language" className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="ar">Arabic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="retry-interval">Retry Interval (seconds)</Label>
              <Input
                id="retry-interval"
                type="number"
                defaultValue="30"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="receipt-footer">Receipt Footer Text</Label>
              <Input
                id="receipt-footer"
                defaultValue="Thank you for choosing OpenPark"
                className="mt-1.5"
              />
            </div>
            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="text-sm text-gray-900">Auto-Print Receipts</p>
                <p className="text-xs text-gray-600">
                  Automatically print after booking
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="p-6">
          <h3 className="text-gray-900 mb-4">Notifications</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-900">Email Notifications</p>
                <p className="text-xs text-gray-600">
                  Send booking confirmations via email
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-900">SMS Notifications</p>
                <p className="text-xs text-gray-600">
                  Send updates via text message
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-900">Push Notifications</p>
                <p className="text-xs text-gray-600">
                  Send alerts to driver mobile apps
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div>
              <Label htmlFor="alert-email">System Alert Email</Label>
              <Input
                id="alert-email"
                type="email"
                defaultValue="alerts@openpark.com"
                className="mt-1.5"
              />
            </div>
          </div>
        </Card>

        {/* Payment Settings */}
        <Card className="p-6">
          <h3 className="text-gray-900 mb-4">Payment Settings</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="revenue-share">Airport Revenue Share (%)</Label>
              <Input
                id="revenue-share"
                type="number"
                defaultValue="20"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select defaultValue="usd">
                <SelectTrigger id="currency" className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usd">USD ($)</SelectItem>
                  <SelectItem value="eur">EUR (€)</SelectItem>
                  <SelectItem value="egp">EGP (E£)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="text-sm text-gray-900">Accept Credit Cards</p>
                <p className="text-xs text-gray-600">
                  Enable credit card payments
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-900">Accept Cash</p>
                <p className="text-xs text-gray-600">
                  Enable cash payments
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}