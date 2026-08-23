cask "brewi" do
  version "0.1.0"
  sha256 :no_check # Replace with sha256 output of your released DMG (shasum -a 256 Brewi_0.1.0_aarch64.dmg)

  url "https://github.com/lablnet/brewi/releases/download/v#{version}/Brewi_#{version}_aarch64.dmg"
  name "Brewi"
  desc "Modern macOS Homebrew Manager built in Rust & Tauri"
  homepage "https://github.com/lablnet/brewi"

  livecheck do
    url :url
    strategy :github_latest
  end

  auto_updates true
  depends_on macos: ">= :big_sur"

  app "Brewi.app"

  zap trash: [
    "~/Library/Application Support/com.lablnet.brewi",
    "~/Library/Caches/com.lablnet.brewi",
    "~/Library/Preferences/com.lablnet.brewi.plist",
    "~/Library/Saved Application State/com.lablnet.brewi.savedState",
  ]
end
