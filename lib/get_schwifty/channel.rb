# frozen_string_literal: true

module GetSchwifty
  # :nodoc
  module Channel
    def subscribed
puts '<Channel.subscribed 1>'
      reject if route.blank?

      stream_from channel_name
      GetSchwiftyRunnerJob.perform_later(channel_name, controller, action, params, *identifiers.flatten)
    end

    def rendered
puts '<Channel.rendered>'
      Rails.cache.write(channel_name, nil) unless GetSchwifty.allow_rerender
    end

    def route
puts '<Channel.route>'
      Rails.cache.read(channel_name)
    end

    def controller
puts '<Channel.controller>'
      (route.split("#").first + "_cable").camelize
    end

    def action
puts '<Channel.action>'
      route.split("#").last
    end

    def identifiers
puts '<Channel.identifiers>'
      connection.identifiers.collect do |key|
        [key.to_s, send(key)]
      end
    end

    def schwifty_job_id
puts '<Channel.schwifty_job_id>'
      params[:id]
    end

    def channel_name
puts '<Channel.channel_name>'
      "get_schwifty:#{schwifty_job_id}"
    end
  end
end
