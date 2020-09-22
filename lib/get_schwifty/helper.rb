module GetSchwifty
  # :nodoc
  module Helper
    def get_schwifty(route, params = nil, &blk)
puts '<GetSchwifty:Helpre:get_schwifty>'
      id = SecureRandom.hex
      Rails.cache.write("get_schwifty:#{id}", route)

      opts = {
        "data-get-schwifty" => id
      }

      opts["data-get-schwifty-params"] = params.to_json if params

      args = [
        :div, nil, opts
      ]

      if block_given?
        args.reject!(&:nil?)
        return content_tag(*args, &blk)
      end

      content_tag(*args)
    end
  end
end
