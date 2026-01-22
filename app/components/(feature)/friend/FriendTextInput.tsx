"use client";

import { AlertTriangle } from "lucide-react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { mutate } from "swr";
import { Button } from "@/app/components/ui/button/Button";
import friendService from "@/app/lib/services/friendService";
import InputField from "../../ui/input/InputField";

const FriendTextInput = ({
  isAuthenticated,
  friend_id,
}: {
  isAuthenticated: boolean;
  friend_id: number;
}) => {
  const friendT = useTranslations("friend");
  const commonT = useTranslations("common");
  const [friend_name, setFriendName] = useState("");
  const [friend_url, setFriendUrl] = useState("");
  const [friend_logo_url, setFriendLogoUrl] = useState("");
  const [friend_description, setFriendDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!friend_name.trim()) {
      toast.error(friendT("sitenameRequired"));
      return;
    }
    if (!friend_url.trim()) {
      toast.error(friendT("siteurlRequired"));
      return;
    }
    if (!friend_logo_url.trim()) {
      toast.error(friendT("sitelogourlRequired"));
      return;
    }
    if (!friend_description.trim()) {
      toast.error(friendT("sitedescriptionRequired"));
      return;
    }
    if (friend_description.length > 100) {
      toast.error(friendT("sitedescriptionTooLong"));
      return;
    }
    setIsSubmitting(true);

    const response = await friendService.createSingleFriend({
      friend_id: friend_id,
      logo_url: friend_logo_url,
      site_url: friend_url,
      chinese_title: friend_name,
      chinese_description: friend_description,
    });

    if (response.status === 200) {
      toast.success("message" in response ? response.message : "Friend added successfully");
      setFriendName("");
      setFriendUrl("");
      setFriendLogoUrl("");
      setFriendDescription("");

      // 更新UI - 重新获取友链列表
      const friendListKey = "/friend/get-friend-lists";
      // 使用 mutate 重新验证数据
      mutate(friendListKey);
    } else {
      toast.error("error" in response ? response.error : "Failed to add friend");
    }

    setIsSubmitting(false);
  };

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Basic Information Row */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {/* Site Name Field */}
        <InputField
          type="text"
          id={friendT("sitename")}
          value={friend_name}
          onChange={(e) => setFriendName(e.target.value)}
          placeholder={friendT("sitename")}
          disabled={!isAuthenticated}
        />

        {/* Site URL Field */}
        <InputField
          type="text"
          id={friendT("siteurl")}
          value={friend_url}
          onChange={(e) => setFriendUrl(e.target.value)}
          placeholder={friendT("siteurl")}
          disabled={!isAuthenticated}
        />
      </motion.div>

      {/* Logo URL Field */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <InputField
          type="text"
          id={friendT("sitelogourl")}
          value={friend_logo_url}
          onChange={(e) => setFriendLogoUrl(e.target.value)}
          placeholder={friendT("sitelogourl")}
          disabled={!isAuthenticated}
        />
      </motion.div>

      {/* Site Description Field */}
      <motion.div
        className="relative"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <InputField
          type="textarea"
          id={friendT("sitedescription")}
          value={friend_description}
          onChange={(e) => setFriendDescription(e.target.value)}
          placeholder={friendT("sitedescription")}
          disabled={!isAuthenticated}
          rows={4}
        />
        <motion.div
          className="absolute bottom-3 right-3 text-xs text-foreground-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          {friend_description.length}/100
        </motion.div>
      </motion.div>

      {/* Action Section */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <motion.div
          className="flex items-center text-sm text-foreground-300"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          {!isAuthenticated && (
            <motion.div
              className="flex items-center"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: 0.3,
                delay: 0.4,
                type: "spring",
                stiffness: 200,
              }}
            >
              <AlertTriangle className="w-4 h-4 mr-1 text-warning-500" />
              <span>{friendT("pleaselogin")}</span>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.6 }}
          >
            <Button
              onClick={handleSubmit}
              disabled={
                !isAuthenticated ||
                !friend_name.trim() ||
                !friend_url.trim() ||
                !friend_logo_url.trim() ||
                !friend_description.trim()
              }
              loading={isSubmitting}
              loadingText={commonT("submitting")}
              variant="primary"
              size="md"
            >
              {commonT("submit")}
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default FriendTextInput;
