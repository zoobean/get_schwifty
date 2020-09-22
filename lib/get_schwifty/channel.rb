# frozen_string_literal: true

module GetSchwifty
  # :nodoc
  module Channel
    def subscribed
puts "<GetSchwifty.Channel.subscribed>"
      reject if route.blank?

      stream_from channel_name
      GetSchwiftyRunnerJob.perform_later(channel_name, controller, action, params, *identifiers.flatten)
    end

    def rendered
puts "<GetSchwifty.Channel.rendered>"
      Rails.cache.write(channel_name, nil) unless GetSchwifty.allow_rerender
    end

    def route
puts "<GetSchwifty.Channel.route>"
      Rails.cache.fetch(channel_name, race_condition_ttl: 10.seconds) { params[:route] }
    end

    def controller
puts "<GetSchwifty.Channel.controller>"
      (route.split("#").first + "_cable").camelize
    end

    def action
puts "<GetSchwifty.Channel.action>"
      route.split("#").last
    end

    def identifiers
puts "<GetSchwifty.Channel.identifiers>"
      connection.identifiers.collect do |key|
        [key.to_s, send(key)]
      end
    end

    def schwifty_job_id
puts "<GetSchwifty.Channel.schwifty_job_id>"
      params[:id]
    end

    def channel_name
puts "<GetSchwifty.Channel.channel_name>"
      "get_schwifty:#{schwifty_job_id}"
    end
  end
end
